const BEAT_SAVER_URL = 'https://beatsaver.com/beatmap/93fe';
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

    console.log(validBeatmaps[0]);
});