import express, { Request, Response } from "express"
import os from "os";
import fs from "fs";
import ErrnoException = NodeJS.ErrnoException;
//const bb = require('express-busboy');
const app = express();

/*bb.extend(server, {
    upload: true,
    path: os.tmpdir(),
});*/

app.use(express.static('frontend'));

const myPath : string = os.tmpdir();
let myRegex: RegExp = /^[a-zA-Z0-9]+$/;

////////////////////////////////// METHOD POST ///////////////////////////////////////////////////
//POST : Creation d'un répertoire
app.post('/api/drive', (req : Request , res : Response) : void => {
    let testChaine : string |  ParsedQs | string[] | ParsedQs[] | undefined = req.query.name;
    if(myRegex.test(testChaine))
    {
        console.log("test réussi");
        //Rajouter un test pour l'existance du dossier
        fs.mkdir(myPath + "/" + req.query.name, (err : ErrnoException | null): void => {
            if(err)
            {
                console.log(err);
            }
        });
        res.status(201).send(myPath);
    }
    else
    {
        console.log("Test echoué");
        res.status(400);
    }
});

//POST : Creation dossier dans un dossier
app.post('/api/drive/:folder', (req : Request, res : Response) : void => {
    let folderName : string = req.params.folder;

    let testChaines : string |  ParsedQs | string[] | ParsedQs[] | undefined = req.query.name;

    if(fs.existsSync(myPath + "/" + folderName))
    {
        if(myRegex.test(testChaines))
        {
            console.log("test réussi");
            //Rajouter un test pour l'existance du dossier
            fs.mkdir(myPath + "/" + folderName + "/" + req.query.name, (err : ErrnoException | null): void => {
                if(err)
                {
                    console.log(err);
                }
            });
            res.status(201).send(myPath + "/" + folderName);
        }
        else
        {
            console.log("Test echoué");
            res.status(400);
        }
    }
    else
    {
        console.log("Le fichier ou répertoire n'existe pas");
        res.status(404);
    }

})


//////////////////////////////////  METHOD GET ///////////////////////////////////////////////////

//GET tous les fichiers et dossiers d'un répertoire
app.get('/api/drive', async (req : Request, res : Response) : Promise<void>  => {
    console.log("coucou2");
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

//GET pour un seul item. Si c'est un répertoire, cela affiche les dossiers et fichiers dedans, si c'est un fichier, affiche les infos du fichier
app.get('/api/drive/:name', (req : Request, res : Response): void => {
    let nameFile: string = req.params.name;
    if(fs.existsSync(myPath + "/" + nameFile))
    {
        fs.stat(myPath + "/" + nameFile, async(err : ErrnoException | null, fold : fs.Stats) : Promise<void> => {
            if (fold.isDirectory())
            {
                //Lire un dossier
                let folders: fs.Dirent[] = await fs.promises.readdir(myPath + "/" + nameFile, {withFileTypes: true});
                const folderList = folders.map((folderName : fs.Dirent) => {
                    if (folderName.isDirectory())
                    {
                        return {
                            "name": folderName.name,
                            "isFolder": folderName.isDirectory(),
                        }
                    }
                    else
                    {
                        return {
                            "name": folderName.name,
                            "isFolder": folderName.isDirectory(),
                            "size": fs.statSync(myPath + "/" + nameFile + "/" + folderName.name)['size']// Pour la size
                        }
                    }
                });
                res.status(200).json(folderList);
            }
            else
            {
                //Lire un fichier
                let myFile = fs.readFileSync(myPath + "/" + nameFile, {encoding: 'utf8'});
                res.setHeader('Content-Type', 'application/octet-stream');
                res.status(200).send(myFile);
            }
        })
    }
    else
    {
        console.log("Le dossier ou répertoire n'existe pas");
        res.status(404);
    }

});


//////////////////////////////////  METHOD DELETE ///////////////////////////////////////////////////
// A faire : Tester si c'est un fichier ou un dossier

//DELETE : Supression d'un répertoire
app.delete('/api/drive/:name', (req : Request, res : Response): void => {
    let nameFile: string = req.params.name;
    let newFileName: string = nameFile.replace('.', '');
    if(myRegex.test(newFileName))
    {
        console.log("test réussi");
        //Rajouter un test pour l'existance du dossier
        fs.stat(myPath + "/" + nameFile, (err : ErrnoException | null, fold : fs.Stats) : void => {
            if (fold.isDirectory())
            {
                fs.rmdir(myPath + "/" + nameFile, (err : ErrnoException | null) : void => {
                    if (err) {
                        console.log(err);
                    }
                });
                res.status(201).send(myPath);
            }
            else
            {
                fs.rm(myPath + "/" + nameFile, (err : ErrnoException | null) : void => {
                    if (err) {
                        console.log(err);
                    }
                });
                res.status(201).send(myPath);
            }
        });
    }
    else
    {
        console.log("Test echoué");
        res.status(400);
    }
});

//DELETE : Supression d'un dossier dans un dossier
app.delete('/api/drive/:folder/:name', (req : Request, res : Response) : void => {
    let folderName: string = req.params.folder;
    let name : string = req.params.name;
    if(fs.existsSync(myPath + "/" + folderName))
    {
        let newFileName = name.replace('.', '');
        if(myRegex.test(newFileName))
        {
            console.log("test réussi");
            //Rajouter un test pour l'existance du dossier
            fs.stat(myPath + "/" + folderName + "/" + name, (err: ErrnoException| null, fold : fs.Stats) : void => {
                if (fold.isDirectory())
                {
                    fs.rmdir(myPath + "/" + folderName + "/" + name, (err : ErrnoException | null) : void => {
                        if (err) {
                            console.log(err);
                        }
                    });
                    res.status(201).send(myPath);
                }
                else
                {
                    fs.rm(myPath + "/" + folderName + "/" + name, (err: ErrnoException | null) : void => {
                        if (err) {
                            console.log(err);
                        }
                    });
                    res.status(201).send(myPath);
                }
            });
        }
        else
        {
            console.log("Test echoué");
            res.status(400);
        }
    }
    else
    {
        console.log("Le fichier ou répertoire est déjà supprimé");
        res.status(404);
    }

})

//////////////////////////////////  METHOD PUT ///////////////////////////////////////////////////
app.put('/api/drive', (req: Request, res: Response) : void =>
{

    res.setHeader('Content-Type', 'multipart/form-data');
    res.setHeader('Accept-Encoding', 'gzip, *');
    res.setHeader('Content-Encoding', 'gzip, *');
    let fileName : any = req.files.file.filename;
    if(fileName)
    {
        console.log("coucou");
        fs.copyFileSync(req.files.file.file, myPath + "/" + fileName);
        res.status(201).send(myPath);
    }
    else
    {
        console.log("pas de fichier");
        res.status(400).send(myPath);
    }
});

app.put('/api/drive/:folder', (req : Request, res : Response) : void => {

    res.setHeader('Content-Type', 'multipart/form-data');
    res.setHeader('Accept-Encoding', 'gzip, *');
    res.setHeader('Content-Encoding', 'gzip, *');
    let folderName : string = req.params.folder;
    if(fs.existsSync(myPath + "/" + folderName))
    {
        let fileFName  : any = req.files.file.filename;
        if (fileFName)
        {
            console.log("coucou");
            fs.copyFileSync(req.files.file.file, myPath + "/" + folderName + "/" + fileFName);
            res.status(201).send(myPath + "/" + folderName);
        }
        else
        {
            console.log("pas de fichier");
            res.status(400).send(myPath + "/" + folderName);
        }
    }
    else
    {
        console.log("Le répertoire n'existe pas");
        res.status(404);
    }
});

export default app;