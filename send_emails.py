import os
import csv
import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("serviceaccountkey.json")
firebase_app = firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://sac-elections.firebaseio.com'
})
ref = db.reference('votes')

with open('emails.csv') as file:
    reader = csv.reader(file, delimiter=',')
    for row in reader:
        email = row[2].replace('.', ',')
        ref.child(email + '/voted').set(False)