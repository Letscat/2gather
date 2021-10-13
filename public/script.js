const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {})


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

  //display as your own msg
  chat= document.getElementById('chat')
  chat.insertAdjacentHTML('beforeend', '<div style="border-bottom:2px solid black;padding:5px;background-color:#2f4640;"><p style="font-weight:bold;margin-top:0;top:0;">You</p><p style="top:0;margin-top;0;">'+msg.text+'</p></div>')

})
//chat receive
socket.on('receiveMsg', msg => {
  chat= document.getElementById('chat')
  chat.insertAdjacentHTML('beforeend', '<div style="border:2px solid black;padding:5px;"><p style="color:#5ba894;font-weight:bold;margin-top:0;top:0;">  '
  +msg.name+'</p><p style="top:0;margin-top;0;color:white;">'+msg.text+'</p></div>')

 
chat.scrollTop = chat.scrollHeight;
  
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
  video.controls = true;
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

socket.on('usernr', usernr => {
  if(usernr ==1  ){
    videoGrid.style.gridAutoRows="45vw";
    videoGrid.style.gridTemplateColumns="repeat(auto-fill, 79vw)";
  }
  if(usernr ==2  ){
    videoGrid.style.gridAutoRows="45vw";
    videoGrid.style.gridTemplateColumns="repeat(auto-fill, 39vw)";
  }
  if(usernr <= 4 && usernr > 2  ){
    videoGrid.style.gridAutoRows="23vw";
    videoGrid.style.gridTemplateColumns="repeat(auto-fill, 26.66vw)";
  }

  if(usernr > 4 ){
    videoGrid.style.gridAutoRows="100px";
    videoGrid.style.gridTemplateColumns="repeat(auto-fill, 100px)";
    
  }

})




