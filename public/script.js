const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})


const myVideo = document.createElement('video')
myVideo.muted = true


const peers = {}
//chat send
uname = document.getElementById('name')
umessage = document.getElementById('msg')
button = document.getElementById('button')
button.addEventListener('click', () => {
  const msg = {text:umessage.value, name:uname.value}
  socket.emit('userMessage', msg)
  document.getElementById('msg').value = "";
})
//chat receive
socket.on('receiveMsg', msg => {
  chat= document.getElementById('chat')
  chat.insertAdjacentHTML('beforeend', '<div style="background-color:white;border-radius:5px;border: 2px solid;"><p style="color:#288FC7">'+msg.name+"</p>"+msg.text+"</p></div>")
  
})




navigator.mediaDevices.getUserMedia({
  video: {
    /*resolution settings to improve performance, 
    i would'nt reccomend going lower than 240 by 135
    Note 2: these settings wont be used for screen sharing - 
    screen sharings often require a high res.
    */
    width: { min: 240, ideal: 320, max: 400},
    height: { min: 135, ideal: 180, max: 225},
    aspectRatio: { ideal: 1.7777777778 }
    
  },
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)
 
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })
  socket.on('user-connected', userId => {
    // user is joining
    setTimeout(() => {
      // user joined
      connectToNewUser(userId, stream)
    }, 1000)
  })
})


socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}
bmute = document.getElementById('Mute');
bmute.addEventListener('click', () => {
  const stream = myVideo.srcObject;
 
 
  stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled);



  
});


bcam = document.getElementById('Cam');
bcam.addEventListener('click', () => {
  const stream = myVideo.srcObject;

 
  stream.getVideoTracks()[0].enabled = !(stream.getVideoTracks()[0].enabled);



  
});






