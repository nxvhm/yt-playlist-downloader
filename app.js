import express from 'express'
import exphbs  from 'express-handlebars';
import fs from 'fs';
import ytdl from 'ytdl-core'
import { Server } from "socket.io";
import http from 'http';
import crypto from 'crypto'
import readline from 'readline';

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
app.set('views', './views');

app.get('/', (req, res) => {
  res.render('index')
})

wss.on('connection', (socket) => {  
  console.log('a user connected', socket.id);
});


app.post('/get-info', (req, res) => {
    let url = req.body.url;

    try {

      ytdl.getURLVideoID(url);

    } catch (error) {
      return res.send({success:0, err: 1, msg: 'Invalid youtube url'});
    }

    ytdl.getInfo(url).then(info => {

      return res.send({success:1, err: 0, data: {
          title: info.videoDetails.title,
          thumbnail: info.videoDetails.thumbnails[3].url,
          formats: info.formats
      }})

    }).catch(err => {
      console.log('error during getBasicInfo');
      console.error(err);
      return res.send({success: 0, error: 1, msg: err.message});
    });
})

app.post('/download', (req, res) => {
    const video = ytdl(req.body.url, {filter: format => format.mimeType == req.body.mimeType});

    let ext  = req.body.mimeType.split(';')[0].split('/')[1],
      title  = req.body.title,
      client = req.body.clientId,
      starttime,    
      filename = title+'.'+ext,
      path = `public/downloaded/${filename}`;
      
    video.pipe(fs.createWriteStream(path));    

    video.once('response', () => {
      starttime = Date.now();
    });
    video.on('progress', (chunkLength, downloaded, total) => {

        const percent = downloaded / total;
        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
        const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;

        let progressMsg = {
          percents: (percent * 100).toFixed(2),
          downloaded: (downloaded / 1024 / 1024).toFixed(2),
          total: (total / 1024 / 1024).toFixed(2),
          remainig: estimatedDownloadTime.toFixed(2)
        }

        wss.to(client).emit('progress', progressMsg);

    });  
    
    video.on('end', () => {
      res.send({success:1, error: 0, filename});
    });
})





httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})