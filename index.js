//npm libraries
const Discord = require('discord.js'); //discord core library
const enmap = require('enmap'); //enmap object for command handler
const Promise = require('bluebird'); //module by error handler for better promise resolves and rejections
Promise.config({longStackTraces:true}); //enabling long stack trees
const fetch = require('node-fetch'); //package for url JSON fetching
fetch.Promise = Promise; //fixing custom Promises

//JSON data
const auth = require('./src/json/auth'); //token and module authentication
const config = require('./src/json/config.json'); //global client settings
const perms = require('./src/json/perms')(); //permission database

//discord client extras
const client = new Discord.Client({disableEveryone:true}); //declaring new discord client
client.config = config; //global config
client.config.ipapikey = auth.ipapikey; //api key for ip dns requests
client.perms = perms; //global permissions sets
client.commands = new enmap(); //declaring new enmap object for command handler
client.fetch = fetch; //declaring global fetch function
client.version = JSON.parse(require('fs').readFileSync('package.json').toString()).version; //global version
client.tr = new Object(); //global object with Talked Recently Sets for every guild
client.cc = 0; //command count for current running session

//utils load
client.logger = require('./utils/logger')(client); //logging in console and in logs channel
client.emoteHandler = require('./utils/emoteHandler')(client);
client.db = require('./utils/mongodb'); //database connection interface

//executing rest of code after establishing successful database connection
client.db.connect(async (err, mongoclient) => {
    if (err) return console.error(`[!mongodb:index.js] Error while connecting:\n${err}`);
    console.log('[mongodb:index.js] Connected to MongoDB!');
    require('./utils/errorHandler'); //executing commands and handling emitted errors
    require('./utils/eventCommandHandler').loadAll(client); //event (and command) handler load
    client.agenda = await require('./utils/agenda').createAgenda(mongoclient);
    require('./utils/agenda').defineJobs(client, client.agenda);

    //discord authentication - logging to WebSocket with specified Discord client token
    client.login(auth.token).catch(async err => {
        console.log(err);
        process.emit('SIGINT'); //closing database connection upon error on Discord WebSocket to save Mongo's bandwidth
    });
    //declaring process termination procedures (like stopping agenda job processing and database disconnection)
    process.on('SIGINT', async () => {
        await require('./utils/agenda').SIGINT(client);
        await client.db.SIGINT;
        process.exit();
    });
    process.on('exit', code => console.log('[node] Process exited with code '+code));
});