const fs = require('fs');
const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("../service-account-key");
const DirectorySeparator = require('./directory-separator');

const DIR_SEPARATOR = DirectorySeparator.WINDOWS;
const BEAT_SAVER_URL = 'https://beatsaver.com/beatmap/';
const CUSTOM_LEVEL_DIR = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Beat Saber\\Beat Saber_Data\\CustomLevels';
const CLIENT_NAME = 'Wendelin';

function getLocalBeatmaps() {
    const beatmapRegexp = new RegExp('^([0-9|aA-zZ]{1,10}) \\((.* - .*)\\)$');

    return fs
        .readdirSync(CUSTOM_LEVEL_DIR)
        .filter(beatmapRegexp.test.bind(beatmapRegexp))
        .map(dir => {
            const match = beatmapRegexp.exec(dir);
            const stats = fs.statSync(CUSTOM_LEVEL_DIR + DIR_SEPARATOR + match[0]);

            return {
                bsrId: match[1],
                title: match[2],
                uploader: CLIENT_NAME,
                dateUploaded: stats.birthtimeMs
            }
        });
}

function sync(beatmaps, onUploaded, onDownloaded) {
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
        databaseURL: "https://beatmap-cloud-store.firebaseio.com"
    });

    const firestore = firebaseAdmin.firestore();
    const beatmapsCollection = firestore.collection('beatmaps');

    updateStore(beatmaps);

    //syncLocal();

    function updateStore(beatmaps) {
        const BATCH_SIZE = 499;
        const batches = [firestore.batch()];
        let operations = 0;
        let currentBatchIdx = 0;

        beatmaps.forEach(beatmap => {
            const docRef = beatmapsCollection.doc(beatmap.bsrId);

            batches[currentBatchIdx].set(docRef, beatmap);

            if (operations++ === BATCH_SIZE) {
                batches.push(firestore.batch());
                currentBatchIdx++;
                operations = 0;
            }
        });

        Promise
            .all(batches.map(batch => batch.commit()))
            .then(onUploaded);
    }

    function syncLocal() {
        beatmapsCollection
            .get()
            .then(snapshot => {
                const documents = [];
                snapshot.forEach(doc => documents.push(doc.data()));

                const bsrIds = documents.map(beatmap => beatmap.bsrId);
                // TODO download via beatsaver API
                onDownloaded(bsrIds);
            })
            .catch(console.error);
    }
}

module.exports = {
    getLocalBeatmaps,
    sync
};