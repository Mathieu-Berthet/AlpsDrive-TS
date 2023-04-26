console.log("coucou");

import http from 'http';
import app from './app';


app.set('port', process.env.PORT || 3000);
const server : any = http.createServer(app);

server.listen(process.env.PORT || 3000);