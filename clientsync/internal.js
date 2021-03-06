const fs = require('fs');
const fetch = require('node-fetch');
const unzipper = require('unzipper');
const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("../service-account-key");
const DirectorySeparator = require('./directory-separator');

const DIR_SEPARATOR = DirectorySeparator.WINDOWS;
const BEAT_SAVER_URL = 'https://beatsaver.com/api';
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

function sync(localBeatmaps, onUploaded, onDownload) {
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
        databaseURL: "https://beatmap-cloud-store.firebaseio.com"
    });

    const firestore = firebaseAdmin.firestore();
    const beatmapsCollection = firestore.collection('beatmaps');

    beatmapsCollection
        .get()
        .then(snapshot => {
            const documents = [];
            snapshot.forEach(doc => documents.push(doc.data()));
            const existingBsrIds = documents.map(beatmap => beatmap.bsrId);

            const newCloudBsrIds = existingBsrIds.filter(bsrId => !localBeatmaps.some(localBeatmap => localBeatmap.bsrId === bsrId));
            const newLocalBeatmaps = localBeatmaps.filter(beatmap => !existingBsrIds.includes(beatmap.bsrId));

            if (newLocalBeatmaps.length > 0) {
                uploadBeatmaps(newLocalBeatmaps)
                    .then(() => onUploaded(newLocalBeatmaps));
            }
            if (newCloudBsrIds.length > 0) {
                downloadBeatmaps(newCloudBsrIds)
                    .then(() => onDownload(newCloudBsrIds));
            }
        })
        .catch(console.error);

    function uploadBeatmaps(beatmaps) {
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

        return Promise
            .all(batches.map(batch => batch.commit()));
    }

}

function downloadBeatmaps(bsrIds) {
    let result = Promise.resolve();

    bsrIds.forEach(bsrId => {
        result = result
            .then(
                () => fetch(`${BEAT_SAVER_URL}/download/key/${bsrId}`)
                    .then(res => {
                        const extractor = unzipper.Extract({path: bsrId});
                        res.body.pipe(extractor);

                        extractor.on('error', console.error);
                        extractor.on('close', () => {
                            const info = JSON.parse(fs.readFileSync(bsrId + DIR_SEPARATOR + 'info.dat', 'utf-8'));
                            const dirName = `${bsrId} (${info._songName} - ${info._levelAuthorName})`
                                .replace(new RegExp('[:<>"\/|\?*]'), '');

                            try {
                                fs.renameSync(bsrId, CUSTOM_LEVEL_DIR + DIR_SEPARATOR + dirName);
                            } catch (e) {
                                console.error(e)
                            }
                        });
                    })
            )
    });

    return result;
}

module.exports = {
    getLocalBeatmaps,
    downloadBeatmaps,
    sync
};