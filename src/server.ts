import express, { Request, Response } from "express"
import os from "os";
import fs from "fs";
import bb from "express-busboy"
const app = express();

bb.extend(app, {
    upload: true,
    path: os.tmpdir(),
});

app.use(express.static('frontend'));

const myPath : string = os.tmpdir();
let myRegex : RegExp = /^[a-zA-Z0-9]+$/;

////////////////////////////////// METHOD POST ///////////////////////////////////////////////////
//POST : Creation dossier dans un dossier
app.post('/api/drive/*', (req : Request, res : Response) : void => {
    let folderName : string = req.params[0];

    let testChaines : string |  ParsedQs | string[] | ParsedQs[] | undefined = req.query.name;

    if(fs.existsSync(myPath + "/" + folderName))
    {
        if(myRegex.test(testChaines))
        {
            console.log("test réussi");
            //Rajouter un test pour l'existance du dossier
            fs.mkdir(myPath + "/" + folderName + "/" + req.query.name, (err : NodeJS.ErrnoException | null): void => {
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
            res.status(400).send("Le nom contient des caractères non alpha-numériques");
        }
    }
    else
    {
        console.log("Le fichier ou répertoire n'existe pas");
        res.status(404).send("Le fichier ou répertoire n'existe pas");
    }

})


//////////////////////////////////  METHOD GET ///////////////////////////////////////////////////
//GET pour un seul item. Si c'est un répertoire, cela affiche les dossiers et fichiers dedans, si c'est un fichier, affiche les infos du fichier
app.get('/api/drive/*', (req : Request, res : Response): void => {
    let nameFile: string = req.params[0];
    if(fs.existsSync(myPath + "/" + nameFile))
    {
        fs.stat(myPath + "/" + nameFile, async(err : NodeJS.ErrnoException | null, fold : fs.Stats) : Promise<void> => {
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
        res.status(404).send("Le dossier ou répertoire n'existe pas");
    }

});


//////////////////////////////////  METHOD DELETE ///////////////////////////////////////////////////
// A faire : Tester si c'est un fichier ou un dossier

//DELETE : Supression d'un répertoire
app.delete('/api/drive/*', (req : Request, res : Response): void => {
    let nameFile: string = req.params[0];
    let newFileName: string = replaceAll(/[./-_* ]/, '', nameFile);
    if(fs.existsSync(myPath + "/" + nameFile))
    {
        if (myRegex.test(newFileName))
        {
            console.log("Test réussi");
            fs.stat(myPath + "/" + nameFile, (err: NodeJS.ErrnoException | null, fold: fs.Stats): void => {
                if (fold.isDirectory())
                {
                    fs.rmdir(myPath + "/" + nameFile, (err: NodeJS.ErrnoException | null): void => {
                        if (err)
                        {
                            console.log(err);
                        }
                    });
                    res.status(201).send(myPath + "/" + nameFile);
                }
                else
                {
                    fs.rm(myPath + "/" + nameFile, (err: NodeJS.ErrnoException | null): void => {
                        if (err)
                        {
                            console.log(err);
                        }
                    });
                    res.status(201).send(myPath + "/" + nameFile);
                }
            });
        }
        else
        {
            console.log("Test echoué");
            res.status(400).send("Le nom contient des caractères non alpha-numériques");
        }
    }
    else
    {
        console.log("Le dossier ou répertoire n'existe pas");
        res.status(404).send("Le dossier ou répertoire n'existe pas");
    }
});


//////////////////////////////////  METHOD PUT ///////////////////////////////////////////////////
app.put('/api/drive/*', (req : Request, res : Response) : void => {

    res.setHeader('Content-Type', 'multipart/form-data');
    let folderName : string = req.params[0];
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
            res.status(400).send("pas de fichier");
        }
    }
    else
    {
        console.log("Le répertoire n'existe pas");
        res.status(404).send("Le répertoire n'existe pas");
    }
});


function replaceAll(recherche : RegExp, remplacement : string, chainToChange : string) : string
{
    return chainToChange.split(recherche).join(remplacement);
}

export default app;