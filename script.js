const video = document.getElementById('video')
const options = new faceapi.TinyFaceDetectorOptions()
var bulbOn = false;
var setupLight = false;
var setupMode = false;
var speechInputReady = true;
var transcript = '';
const labels = ['codes']
var setupUser = ''
var name = ''

clippy.load('Clippy', function(agent){
  agent.show()
  agent.moveTo($(window).width()/2, $(window).height()/2)
  agent.speak('Loading neural nets into your browser; this can take upwards of 30 seconds!')
  agent.play('SendMail')
  setTimeout( function() {
    loadNetworks();
    agent.hide();
  }, 7000) // enough time for paper plane to look like it's disappearing
})

async function loadNetworks(){
  Promise.all([
    // faceapi.nets.tinyFaceDetector.loadFromUri('/clippy-smart-home/models'),
    // faceapi.nets.faceLandmark68Net.loadFromUri('/clippy-smart-home/models'),
    // faceapi.nets.faceRecognitionNet.loadFromUri('/clippy-smart-home/models'),
    // faceapi.nets.faceExpressionNet.loadFromUri('/clippy-smart-home/models'),
    // faceapi.nets.ssdMobilenetv1.loadFromUri('/clippy-smart-home/models')
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
  ]).then(startVideo)
}

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )

}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// TOUCH -> not working at the moment
// var dragItem = document.querySelector("clippy");
// var container = document.querySelector("video");

// var active = false;
// var currentX;
// var currentY;
// var initialX;
// var initialY;
// var xOffset = 0;
// var yOffset = 0;

// container.addEventListener("touchstart", dragStart, false);
// container.addEventListener("touchend", dragEnd, false);
// container.addEventListener("touchmove", drag, false);

// container.addEventListener("mousedown", dragStart, false);
// container.addEventListener("mouseup", dragEnd, false);
// container.addEventListener("mousemove", drag, false);

// function dragStart(e) {
//   if (e.type === "touchstart") {
//     initialX = e.touches[0].clientX - xOffset;
//     initialY = e.touches[0].clientY - yOffset;
//   } else {
//     initialX = e.clientX - xOffset;
//     initialY = e.clientY - yOffset;
//   }

//   if (e.target === dragItem) {
//     active = true;
//   }
// }

// function dragEnd(e) {
//   initialX = currentX;
//   initialY = currentY;

//   active = false;
// }

// function drag(e) {
//   if (active) {
  
//     e.preventDefault();
  
//     if (e.type === "touchmove") {
//       currentX = e.touches[0].clientX - initialX;
//       currentY = e.touches[0].clientY - initialY;
//     } else {
//       currentX = e.clientX - initialX;
//       currentY = e.clientY - initialY;
//     }

//     xOffset = currentX;
//     yOffset = currentY;

//     setTranslate(currentX, currentY, dragItem);
//   }
// }

// function setTranslate(xPos, yPos, el) {
//   el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
// }


video.addEventListener('play', async () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: $(window).width(), height: 
    $(window).height() }
  // const displaySize = { width: canvas.width, height: canvas.height }
  faceapi.matchDimensions(canvas, displaySize)
  const labeledFaceDescriptors = await loadLabeledImages()
  const maxDescriptorDistance = 0.6
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)
  console.log('beginning face detection/recognition!')
  clippy.load('Clippy', function(agent){
    agent.show();
    agent.play('GetAttention')
    agent.speak('Almost done! Please ensure you have webcam/microphone access allowed and full screen this site!');
    setTimeout( async() => {
      agent.speak('You can invoke me by saying \'clippy\'; why don\'t you ask me about the light on your head?');
    }, 11000)
    setTimeout( function () {
      // Ensure Clippy can load before the neural net models load
      setInterval(async () => {
        // Face detection
        const detections = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // Face recognition
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        results.forEach((result, i) => {
          const box = resizedDetections[i].detection.box
          gestureToUser(box, agent)
          ctx.drawImage(img, box.x + (box.width - img.width) / 2, box.y - img.height);
          const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
          drawBox.draw(canvas)
        })
      }, 125)}, 5000)

      setInterval(async () => {
        x = getRandomInt(0, $(window).width() - 150)
        y = getRandomInt(0, $(window).height() - 150)
        agent.moveTo(x, y);
      }, 15000)
    })
  })

  

  // Searching is a good animation for after the rule is complete

// emptytrash, searching, getartsy, writing, wave, Congratulate (after the rule is made), goodbye, processing, gettechy, getAttention, explain or thinking, SendMail
//   0: "Congratulate"
// 1: "LookRight"
// 2: "SendMail"
// 3: "Thinking"
// 4: "Explain"
// 5: "IdleRopePile"
// 6: "IdleAtom"
// 7: "Print"
// 8: "Hide"
// 9: "GetAttention"
// 10: "Save"
// 11: "GetTechy"
// 12: "GestureUp"
// 13: "Idle1_1"
// 14: "Processing"
// 15: "Alert"
// 16: "LookUpRight"
// 17: "IdleSideToSide"
// 18: "GoodBye"
// 19: "LookLeft"
// 20: "IdleHeadScratch"
// 21: "LookUpLeft"
// 22: "CheckingSomething"
// 23: "Hearing_1"
// 24: "GetWizardy"
// 25: "IdleFingerTap"
// 26: "GestureLeft"
// 27: "Wave"
// 28: "GestureRight"
// 29: "Writing"
// 30: "IdleSnooze"
// 31: "LookDownRight"
// 32: "GetArtsy"
// 33: "Show"
// 34: "LookDown"
// 35: "Searching"
// 36: "EmptyTrash"
// 37: "Greeting"
// 38: "LookUp"
// 39: "GestureDown"
// 40: "RestPose"
// 41: "IdleEyeBrowRaise"
// 42: "LookDownLeft"
function lightbulbState(bulbOn) {
  if (bulbOn) {
    var img = document.getElementById("bulb_on");
  } else {
    var img = document.getElementById("bulb_off");
  }
  return img
}

function loadLabeledImages() {
  const labels = ['codes']
  return Promise.all(
    labels.map(async label => {
      const descriptions = [] 
      const imgUrl = `./labeled_images/codes/${label}.jpg`
      // const imgUrl = `/clippy-smart-home/labeled_images/codes/${label}.jpg`
      const img = await faceapi.fetchImage(imgUrl)    
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
      descriptions.push(detections.descriptor)
      console.log('face recognition labeled images loaded!')
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

async function gestureToUser(box, agent) {
  // Depending on a random number between 1 - 150
  // clippy will gesture to the user if that number is 0
  let num = getRandomInt(0, 200)
  if (num == 0){
    agent.gestureAt(box.x + box.width/2, box.y + box.height/2)
    console.log('GESTURED TO USER')
  }
}
