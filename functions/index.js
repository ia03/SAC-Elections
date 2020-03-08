const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');

admin.initializeApp();

var db = admin.database();
var ref = db.ref('votes');


exports.submitVote = functions.https.onCall((data, context) => {
  var votes = data.votes.filter(value => ['one', 'two', 'three', 'four'].includes(value));
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in ' +
        'to vote.');
  }
  const email = context.auth.token.email.replace(/\./g, ',');
  return ref.once('value').then(function(snapshot) {
    if (!email.endsWith("@wrdsb,ca")) {
      throw new functions.https.HttpsError('permission-denied', 'You must use a WRDSB ' +
          'email to vote.');
    }
	if (snapshot.hasChild(email)) {
		var vote = snapshot.child(email);
		if (vote.child('voted').val()) {
		  throw new functions.https.HttpsError('failed-precondition', 'You have already voted.');
		}
	}
    
    if (votes.length != 2) {
      throw new functions.https.HttpsError('failed-precondition', 'You must vote for exactly ' +
          'two candidates.');
    }
    
    var updates = {};
    
    updates[email + '/vote1'] = votes[0];
    updates[email + '/vote2'] = votes[1];
    updates[email + '/voted'] = true;
	updates[email + '/ip'] = context.rawRequest.ip;
	updates[email + '/date'] = new Date().toLocaleString();
    ref.update(updates);
    console.log(context.auth.token.email + ' (' + context.auth.token.name + ')' +
		' has voted for ' + votes[0] + ' and ' + votes[1] + ' with IP ' +
		context.rawRequest.ip);
    return { text: 'Your vote has been successfully cast.' };
  });
});

exports.viewResults = functions.https.onCall((data, context) => {
	if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in ' +
        'to view results.');
  }
	const email = context.auth.token.email.replace(/\./g, ',');
	return ref.once('value').then(function(snapshot) {
		if (snapshot.hasChild(email + '/admin') && snapshot.child(email + '/admin').val()) {
			var counter = {};
			// Count with IP filtering.
			snapshot.forEach(function(childSnapshot) {
				if (childSnapshot.child('ip').val() == '199.212.251.10') {
					var key1 = childSnapshot.child('vote1').val();
					counter[key1] = (counter[key1] || 0) + 1;
					var key2 = childSnapshot.child('vote2').val();
					counter[key2] = (counter[key2] || 0) + 1;
				}
			});
			let cecelia = counter['one'] || 0;
			let matthew = counter['two'] || 0;
			let maria = counter['three'] || 0;
			let sven = counter['four'] || 0;
			
			filtered_results = `Cecelia: ${cecelia} <br /> Matthew: ${matthew} <br /> Maria: ${maria} <br /> Sven: ${sven} <br />`;
			
			// Count without IP filtering.
			counter = {};
			
			snapshot.forEach(function(childSnapshot) {
				var key1 = childSnapshot.child('vote1').val();
				counter[key1] = (counter[key1] || 0) + 1;
				var key2 = childSnapshot.child('vote2').val();
				counter[key2] = (counter[key2] || 0) + 1;
			});
			cecelia = counter['one'] || 0;
			matthew = counter['two'] || 0;
			maria = counter['three'] || 0;
			sven = counter['four'] || 0;
			
			unfiltered_results = `Cecelia: ${cecelia} <br /> Matthew: ${matthew} <br /> Maria: ${maria} <br /> Sven: ${sven} <br />`;
			return { text:  'Filtered:<br />' + filtered_results + 'Unfiltered:<br />' + unfiltered_results};
		} else {
			throw new functions.https.HttpsError('permission-denied', 'You do not have permission to see the results.');
		}
		
	});
});