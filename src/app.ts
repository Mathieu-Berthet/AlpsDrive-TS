import express, { Request, Response } from "express"
import os from "os";
import fs from "fs";
//const bb = require('express-busboy');
const app = express();

/*bb.extend(app, {
    upload: true,
    path: os.tmpdir(),
});*/

app.use(express.static('frontend'));

const myPath : string = os.tmpdir();

app.get('/api/drive', async (req : Request, res : Response)  => {
    let files : fs.Dirent[] = await fs.promises.readdir(myPath, {withFileTypes : true});
    const fileList = files.map((fileName : fs.Dirent) => {
        if(fileName.isDirectory())
        {
            return {
                "name" : fileName.name,
                "isFolder" : fileName.isDirectory(),
            }
        }
        else
        {
            return {
                "name" : fileName.name,
                "isFolder" : fileName.isDirectory(),
                "size": fs.statSync(myPath + "/" + fileName.name)['size']
            }
        }
    });
    res.status(200).json(fileList);
})


export default app;