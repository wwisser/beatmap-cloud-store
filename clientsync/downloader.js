/* Utility beatmap parallel downloader which, unlike ModAssistant OneClick, actually works */
const impl = require('./internal');

let bsrIds = []; // fill with the maps you wish to download

const localBsrIds = impl.getLocalBeatmaps().map(map => map.bsrId);

bsrIds = bsrIds.filter(id => !localBsrIds.includes(id));
console.log(`Downloading beatmaps: ${bsrIds.join(', ')}`);
impl.downloadBeatmaps(bsrIds);
