const functions = require('firebase-functions');
const firebaseAdmin = require("firebase-admin");
const express = require('express');
firebaseAdmin.initializeApp();
const cors = require('cors')({origin: true});
const app = express();

const validateFirebaseIdToken = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];

        try {
            req.user = await admin.auth().verifyIdToken(idToken);
            next();
        } catch (err) {
            res.status(403).send('Unauthorized');
        }
    } else {
        res.status(403).send('Unauthorized');
    }
};

app.use(cors);
app.use(validateFirebaseIdToken);

// experimental functions
app.get('bsr-ids', (req, res) => {
    firebaseAdmin
        .firestore()
        .collection('beatmaps')
        .get()
        .then(snapshot => {
            const documents = [];
            snapshot.forEach(doc => documents.push(doc.data()));

            const bsrIds = documents.map(beatmap => beatmap.bsrId);
            res.status(200).send(bsrIds);
        });
});

exports.app = functions.https.onRequest(app);