const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
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


server.listen(3000)