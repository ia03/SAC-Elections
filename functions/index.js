const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

var db = admin.database();
var ref = db.ref('votes');


exports.submitVote = functions.https.onCall((data, context) => {
  var votesIn = data.votes;
  var votesOut = [];
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'You must be signed in ' +
        'to vote.');
  }
  const email = context.auth.token.email.replace(/\./g, ',');
  return ref.once('value').then(function(snapshot) {
    if (!snapshot.hasChild(email)) {
      throw new functions.https.HttpsError('failed-precondition', 'You are not registered ' +
          'to vote.');
    }
    var vote = snapshot.child(email);
    if (vote.child('voted').val()) {
      throw new functions.https.HttpsError('failed-precondition', 'You have already voted.');
    }
    if (votesIn.includes('one')) {
      votesOut.push('one');
    }
    if (votesIn.includes('two')) {
      votesOut.push('two');
    }
    if (votesIn.includes('three')) {
      votesOut.push('three');
    }
    if (votesIn.includes('four')) {
      votesOut.push('four');
    }
    
    if (votesOut.length != 2)
    {
      throw new functions.https.HttpsError('failed-precondition', 'You must vote for exactly ' +
          'two candidates.');
    }
    
    var updates = {};
    
    updates[email + '/vote1'] = votesOut[0];
    updates[email + '/vote2'] = votesOut[1];
    updates[email + '/voted'] = true;
	updates[email + '/ip'] = context.rawRequest.ip;
    ref.update(updates);
    console.log(context.auth.token.email + ' (' + context.auth.token.name + ')' +
		' has voted for ' + votesOut[0] + ' and ' + votesOut[1] + ' with IP ' +
		context.rawRequest.ip);
    return { text: 'Your vote has been successfully cast.' };
  });
});