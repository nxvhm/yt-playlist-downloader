import express from 'express'
import exphbs  from 'express-handlebars';
import fs from 'fs';
import ytdl from 'ytdl-core'
import readline  from 'readline';
const app = express()
const port = 3000


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

app.post('/download', (req, res) => {
    let url = req.body.url;
    const video = ytdl(url);
    let starttime;    
    video.pipe(fs.createWriteStream('video.mp4'));    
    video.once('response', () => {
        starttime = Date.now();
      });

    video.on('progress', (chunkLength, downloaded, total) => {
        const percent = downloaded / total;
        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
        const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
        process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
        process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
        process.stdout.write(`, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `);
        readline.moveCursor(process.stdout, 0, -1);
    });    
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})