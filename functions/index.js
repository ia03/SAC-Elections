const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

var db = admin.database();
var ref = db.ref('votes');


exports.submitVote = functions.https.onCall((data, context) => {
  var votes = data.votes.filter(value => ['one', 'two', 'three', 'four'].includes(value));
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'You must be signed in ' +
        'to vote.');
  }
  const email = context.auth.token.email.replace(/\./g, ',');
  return ref.once('value').then(function(snapshot) {
    if (!email.endsWith("@wrdsb,ca")) {
      throw new functions.https.HttpsError('failed-precondition', 'You must use a WRDSB ' +
          'email to vote.');
    }
	if (snapshot.hasChild(email))
	{
		var vote = snapshot.child(email);
		if (vote.child('voted').val()) {
		  throw new functions.https.HttpsError('failed-precondition', 'You have already voted.');
		}
	}
    
    if (votes.length != 2)
    {
      throw new functions.https.HttpsError('failed-precondition', 'You must vote for exactly ' +
          'two candidates.');
    }
    
    var updates = {};
    
    updates[email + '/vote1'] = votes[0];
    updates[email + '/vote2'] = votes[1];
    updates[email + '/voted'] = true;
	updates[email + '/ip'] = context.rawRequest.ip;
    ref.update(updates);
    console.log(context.auth.token.email + ' (' + context.auth.token.name + ')' +
		' has voted for ' + votes[0] + ' and ' + votes[1] + ' with IP ' +
		context.rawRequest.ip);
    return { text: 'Your vote has been successfully cast.' };
  });
});