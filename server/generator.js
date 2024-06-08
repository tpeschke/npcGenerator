const express = require('express')
  , bodyParser = require('body-parser')
  , cors = require('cors')
  , config = require('./config')
  , path = require('path')
  , session = require('express-session')
  , passport = require('passport')
  , npcCtrl = require('./npcControler')
  , axios = require('axios')

const app = new express()
app.use(bodyParser.json())
app.use(cors())
app.use(express.static(__dirname + `/../dist/bonfireSRD`));
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

app.get('/createNPC', npcCtrl.createNPC)

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../dist/bonfireSRD/index.html'))
})
// ================================== \\

app.listen(config.port, _ => {
    axios.get(config.srdEndpoint + '/getCharacteristics').then(result => {
        npcCtrl.setCharacteristics(result.data)
        console.log('Characteristics Fetched')
        console.log(`See the mountain, the river, and the storm; these are the Grim Reaper ${config.port}`)
    })
})
