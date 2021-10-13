const { PeerServer } = require('peer');

const peerServer = PeerServer({ port: 3001, path: '/myapp' });
const { v4: uuidV4 } = require('uuid')
const express = require('express')
const app = express()
const fs = require('fs')
const https = require('https')
const options = {
  key:fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem')
}
const httpsServer = https.createServer(options, app)
const io = require('socket.io')(httpsServer)

var usernr= 0;

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    //update usernr
    usernr = usernr +1;

    //send new usercount to socket
    io.to(roomId).emit('usernr', usernr)

    //message sent
    socket.on('userMessage', msg =>{
      //message gets back to be received by users
      socket.to(roomId).broadcast.emit('receiveMsg', msg)
    })

    socket.on('disconnect', () => {
      usernr = usernr -1;
      
      //send new usercount to socket
      io.to(roomId).emit('usernr', usernr)
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })

                                              
})


httpsServer.listen(3000, function () {
  console.log("Example app listening at https://%s:%s", httpsServer.address().address, httpsServer.address().port);
});