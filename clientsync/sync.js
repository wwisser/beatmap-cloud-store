const impl = require('./internal');

const localBeatmaps = impl.getLocalBeatmaps();
console.log(`Found ${localBeatmaps.length} local beatmaps...`);

impl.sync(
    localBeatmaps,
    () => console.log('Upload sync done.'),
    bsrIds => console.log(`Download sync done with ${bsrIds.length} beatmaps.`)
);