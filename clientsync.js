const BEAT_SAVER_URL = 'https://beatsaver.com/beatmap/';
const CUSTOM_LEVEL_DIR = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Beat Saber\\Beat Saber_Data\\CustomLevels';
const CLIENT_NAME = 'Wendelin';

const beatmapRegexp = new RegExp('^([0-9|aA-zZ]{1,10}) \\((.* - .*)\\)$');
const fs = require('fs');

fs.readdir(CUSTOM_LEVEL_DIR, (err, files) => {
    var validBeatmaps = files
        .filter(beatmapRegexp.test.bind(beatmapRegexp))
        .map(dir => {
            const match = beatmapRegexp.exec(dir);

            return {
                bsrId: match[1],
                title: match[2]
            }
        });

    const firebaseAdmin = require("firebase-admin");
    const serviceAccount = require("./service-account-key");

    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
        databaseURL: "https://beatmap-cloud-store.firebaseio.com"
    });

    firebaseAdmin
        .firestore()
        .collection('beatmaps')
        .get()
        .then(snapshot => {
            const documents = [];
            snapshot.forEach(doc => documents.push(doc.data()));
        })
        .catch(console.error);
});