const functions = require('firebase-functions');
const firebaseAdmin = require("firebase-admin");
firebaseAdmin.initializeApp();

exports.bsrIds = functions.https.onRequest(async (req, res) => {
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
