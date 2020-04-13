const fetch = require('node-fetch');
const fs = require('fs');
const dest = fs.createWriteStream('./4eb1.zip');
(async () => {
    fetch(
        "https://beatsaver.com/cdn/4eb1/a6328fe9744223df54bf7cfde7cd75f84692abc5.zip",
        {
            "credentials": "include",
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "if-range": "\"q72jsn4pvjm\"",
                "range": "bytes=4847242-4847242",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
            },
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": null,
            "method": "GET",
            "mode": "cors"
        }).then(res => {
        res.body.pipe(dest);
    });
})();
