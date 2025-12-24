
var fs = require('fs');

export const convertbase64 = {
    getBase64(str:File)
    {
        return fs.readFileSync(str, 'base64');
    }
}