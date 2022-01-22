import 'dotenv/config' 
import express from 'express'
import exphbs  from 'express-handlebars';
import { Server } from "socket.io";
import http from 'http';

import { GetVideoInfo, DownloadVideoFromSelectedFormat } from './controllers/Video.js'
import { GetPlaylistInfoForm, GetPlaylistContents } from './controllers/Playlist.js';
const app = express()
const port = 3000
const httpServer = http.createServer(app)
const wss = new Server(httpServer);

const hbs = exphbs.create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options){ 
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this); 
            return null;
        } 
    }    
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './app/views');

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/playlist', GetPlaylistInfoForm)
app.post('/playlist-info', GetPlaylistContents)

wss.on('connection', (socket) => {  
  console.log('a user connected', socket.id);
});

app.post('/get-info', GetVideoInfo)
app.post('/download', DownloadVideoFromSelectedFormat(wss))

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})