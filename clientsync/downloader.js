/* Utility beatmap parallel downloader which, unlike ModAssistant OneClick, actually works */
const impl = require('./internal');

const bsrIds = []; // fill with the maps you wish to download

impl.downloadBeatmaps(bsrIds)
    .then(() => console.log('download done'));