const firebaseConfig = {
  apiKey: "AIzaSyDnIK8Ccn1cLBo_vzBdQOAgWGIKZWkbQ8s",
  authDomain: "sac-elections.firebaseapp.com",
  databaseURL: "https://sac-elections.firebaseio.com",
  projectId: "sac-elections",
  storageBucket: "sac-elections.appspot.com",
  messagingSenderId: "614846879361",
  appId: "1:614846879361:web:040894bb7e8b39fc221f80",
  measurementId: "G-0G78F156ND"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    document.getElementById('authcontent').hidden = false;
	document.getElementById('signinreminder').hidden = true;
	document.getElementById('email').innerHTML = 'Signed in as ' + user.displayName +
		' (' + user.email + ')';
  } else {
    document.getElementById('authcontent').hidden = true;
	document.getElementById('signinreminder').hidden = false;
	document.getElementById('email').innerHTML = '';
    var ui = new firebaseui.auth.AuthUI(firebase.auth());

    ui.start('#firebaseui-auth-container', {
      signInSuccessUrl: window.location.href,
      signInOptions: [
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          scopes: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
          ],
		  customParameters: {
			  prompt: 'select_account'
		  }
        } 
      ]
    });
  }
});

function submitVote() {
  var votes = [];
  var submitVoteCallable = firebase.functions().httpsCallable('submitVote');
  if (document.getElementById('one').checked) {
    votes.push('one');
  }
  if (document.getElementById('two').checked) {
    votes.push('two');
  }
  if (document.getElementById('three').checked) {
    votes.push('three');
  }
  if (document.getElementById('four').checked) {
    votes.push('four');
  }
  submitVoteCallable({votes: votes}).then(function(result) {
    document.getElementById('statusmsg').innerHTML = result.data.text;
    document.getElementById('errormsg').innerHTML = '';
  }).catch(function(error) {
    document.getElementById('errormsg').innerHTML = error.message;
    document.getElementById('statusmsg').innerHTML = '';
  });
  document.getElementById('statusmsg').innerHTML = 'Submitting vote...'
  document.getElementById('errormsg').innerHTML = '';
}

$("#submit").click(submitVote);
$("#signoutbtn").click(function() {firebase.auth().signOut();} );

