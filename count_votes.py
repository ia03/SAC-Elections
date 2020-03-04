import os
import csv
import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("serviceaccountkey.json")
firebase_app = firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://sac-elections.firebaseio.com'
})
ref = db.reference('votes')

counter = {}

data = ref.get()

for vote in data.keys():
    if 'vote1' in data[vote]:
        if data[vote]['vote1'] in counter:
            counter[data[vote]['vote1']] += 1
        else:
            counter[data[vote]['vote1']] = 1
    if 'vote2' in data[vote]:
        if data[vote]['vote2'] in counter:
            counter[data[vote]['vote2']] += 1
        else:
            counter[data[vote]['vote2']] = 1

print(counter)