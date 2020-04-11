const impl = require('./internal');

const localBeatmaps = impl.getLocalBeatmaps();
console.log(`Found ${localBeatmaps.length} local beatmaps...`);

impl.sync(
    localBeatmaps,
    beatmaps => console.log(`Uploaded ${beatmaps.length} new beatmaps into cloud store.`),
    bsrIds => console.log(`Downloaded ${bsrIds.length} new beatmaps to local directory.`)
);