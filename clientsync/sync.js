const impl = require('./internal');

const localBeatmaps = impl.getLocalBeatmaps();
console.log(`Found ${localBeatmaps.length} local beatmaps...`);

impl.sync(
    localBeatmaps,
    beatmaps => console.log(`Uploaded ${beatmaps.length} new beatmap(s) into cloud store.`),
    bsrIds => console.log(`Downloading ${bsrIds.length} new beatmap(s) to local directory...`)
);