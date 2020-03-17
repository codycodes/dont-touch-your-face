const video = document.getElementById('video')
const options = new faceapi.TinyFaceDetectorOptions()
const labels = ['codes']

const AREA_INTERSECTION_THRESHOLD = .15;

// clippy.load('Clippy', function(agent){
//   agent.show()
//   agent.moveTo($(window).width()/2, $(window).height()/2)
//   agent.speak('Loading neural nets into your browser; this can take upwards of 30 seconds!')
//   agent.play('SendMail')
//   setTimeout( function() {
//     loadNetworks();
//     agent.hide();
//   }, 7000) // enough time for paper plane to look like it's disappearing
// })

// async function loadNetworks(){
  Promise.all([
    // faceapi.nets.tinyFaceDetector.loadFromUri('/clippy-smart-home/models'),
    // faceapi.nets.faceLandmark68Net.loadFromUri('/clippy-smart-home/models'),
    // faceapi.nets.faceRecognitionNet.loadFromUri('/clippy-smart-home/models'),
    // faceapi.nets.faceExpressionNet.loadFromUri('/clippy-smart-home/models'),
    // faceapi.nets.ssdMobilenetv1.loadFromUri('/clippy-smart-home/models')
    
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    // faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    // faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    // faceapi.nets.faceExpressionNet.loadFromUri('./models')

    // JUST USE TINYDETECTOR FOR NOW
    // faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
  ]).then(startVideo)
// }
console.log('go!')

if (!window.Notification) {
  console.log('Browser does not support notifications.');
} else {
  // check if permission is already granted
  if (Notification.permission === 'granted') {
      // show notification here
  } else {
      // request permission from user
      Notification.requestPermission().then(function(p) {
         if(p === 'granted') {
             // show notification here
         } else {
             console.log('User blocked notifications.');
         }
      }).catch(function(err) {
          console.error(err);
      });
  }
}

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
    )
    console.log(screen.height)
    video.width = screen.width;
    video.height = screen.height; // * (3 / 4) // For SAFARI
}


video.addEventListener('loadedmetadata', (event) => {
  console.log('The duration and dimensions of the media and tracks are now known. ');
});

$(function () {
  $("#video").bind("loadedmetadata", function () {
    video.width = screen.width;
    video.height = screen.height;
  });
})
    

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

video.addEventListener('play', async () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: $(window).width(), height: 
    $(window).height() }
    // $(window).height() }
  // const displaySize = { width: canvas.width, height: canvas.height }
  faceapi.matchDimensions(canvas, displaySize)
  // TODO: Add Face recognition back or remove it later.
  // const labeledFaceDescriptors = await loadLabeledImages()
  // const maxDescriptorDistance = 0.6
  // const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)
  console.log('beginning face detection/recognition!')


  // setInterval(async () => {
  //   const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
  //   const resizedDetections = faceapi.resizeResults(detections, displaySize)
  //   canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  //   faceapi.draw.drawDetections(canvas, resizedDetections)
  //   faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
  //   faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  // }, 100)


  console.log('******************************************')

  const modelParams = {
    flipHorizontal: false,   // flip e.g for video 
    imageScaleFactor: 1,  // reduce input image size for gains in speed.
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    // scoreThreshold: 0.85,    // confidence threshold for predictions.
    scoreThreshold: 0.65,    // confidence threshold for predictions.
  }
  
  var handBottomRight = []
  var handTopLeft = []
  var faceBottomRight = []
  var faceTopLeft = []
  handTrack.load(modelParams).then(model => {
    console.log("Handtrack model loaded")
    setInterval(async () => {
      // const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      let handTrackResizedDetections = {}
      model.detect(video).then(predictions => {
        // console.log('Predictions: ', predictions);
        for (var i = 0; i < predictions.length; i++){
         let ctx = canvas.getContext('2d')
         ctx.beginPath();
         ctx.lineWidth = "6";
         ctx.strokeStyle = "red";
         let x0 = predictions[i]['bbox']['0']
         let y0 = predictions[i]['bbox']['1']
         let width = predictions[i]['bbox']['2']
         let height = predictions[i]['bbox']['3']
         handBottomRight[i] = 
         { 
           'x': x0 + width,
           'y': y0 + height,
           'area': width * height
         } 
         handTopLeft[i] = 
         { 
           'x': x0,
           'y': y0,
           'area': width * height           
         }
         ctx.rect(x0, y0, width, height);
         //  ctx.rect(predictions[i]['bbox']['1'], predictions[i]['bbox']['0'] - predictions[i]['bbox']['1'], predictions[i]['bbox']['2'], predictions[i]['bbox']['2'] - predictions[i]['bbox']['2']);
         ctx.stroke();
        }
      });
      // console.log(Object.values(resizedDetections))
      for (var i = 0; i < resizedDetections.length; i++){
      // console.log('face x: ', resizedDetections[i]['box']['x'])
      // console.log('face y: ', resizedDetections[i]['box']['y'])
      // console.log('face width: ', resizedDetections[i]['box']['x'] + resizedDetections[i]['box']['width'])
      // console.log('face height: ', resizedDetections[i]['box']['y'] + resizedDetections[i]['box']['height'])
        faceTopLeft[i] = 
        {
          'x': resizedDetections[i]['box']['x'],
          'y': resizedDetections[i]['box']['y'],
          'area': resizedDetections[i]['box']['width'] * resizedDetections[i]['box']['height']
        }
        faceBottomRight[i] = 
        {
          'x': resizedDetections[i]['box']['x'] + resizedDetections[i]['box']['width'] ,
          'y': resizedDetections[i]['box']['y'] + resizedDetections[i]['box']['height'],
          'area': resizedDetections[i]['box']['width'] * resizedDetections[i]['box']['height']
        }
      }
      // just go through the smallest amount of hands/faces
      for (var i = 0; i < Math.min(handBottomRight.length, faceTopLeft.length); i++){
        areaIntersection = Math.max(0, Math.min(handBottomRight[i].x, faceBottomRight[i].x) - Math.max(handTopLeft[i].x, faceTopLeft[i].x)) * Math.max(0, Math.min(handBottomRight[i].y, faceBottomRight[i].y) - Math.max(handTopLeft[i].y, faceTopLeft[i].y))
        // console.log(`Area of intersection ${areaIntersection} for ${i} is ${areaIntersection / (handTopLeft.area + faceTopLeft.area - areaIntersection)}`)        
        console.log(`RATIO: ${areaIntersection / (handTopLeft[i].area + faceTopLeft[i].area - areaIntersection)}`)
        let ratio = areaIntersection / (handTopLeft[i].area + faceTopLeft[i].area - areaIntersection)
        if (ratio >= AREA_INTERSECTION_THRESHOLD){
          var notify = new Notification('Stop touching your face!');
        }
        // console.log(`RATIO: ${areaIntersection} ${handTopLeft[i].area} ${faceTopLeft.area}`)        
      }
      //   // console.log('face x: ', resizedDetections[i]['detection']['box']['x'])
      //   // console.log('face y: ', resizedDetections[i]['detection']['box']['y'])
      //   // console.log('face width: ', resizedDetections[i]['detection']['box']['x'] + resizedDetections[i]['detection']['box']['width'])
      //   // console.log('face height: ', resizedDetections[i]['detection']['box']['y'] + resizedDetections[i]['detection']['box']['height'])
      // }
      // faceapi.draw.drawDetections(canvas, handTrackResizedDetections)
      faceapi.draw.drawDetections(canvas, resizedDetections)

      // reset arrays for next iteration
      faceBottomRight = []
      faceTopLeft = []
      handBottomRight = []
      handTopLeft = []
      // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }, 100)
  });

  // handTrack.load().then(model => {
  //   console.log("Handtrack model loaded")
  //   setInterval(async () => {
  //     model.detect(video).then(predictions => {
  //       console.log('Predictions: ', predictions); 
  //     });
  //   }, 100)
  // });

  // clippy.load('Clippy', function(agent){
  //   agent.show();
  //   agent.play('GetAttention')
  //   agent.speak('Almost done! Please ensure you have webcam/microphone access allowed and full screen this site!');
  //   setTimeout( async() => {
  //     agent.speak('You can invoke me by saying \'clippy\'; why don\'t you ask me about the light on your head?');
  //   }, 11000)
  //   // setTimeout( function () {
  //   //   // Ensure Clippy can load before the neural net models load
  //   //   setInterval(async () => {
  //   //     // Face detection
  //   //     const detections = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors()
  //   //     const resizedDetections = faceapi.resizeResults(detections, displaySize)
  //   //     const ctx = canvas.getContext("2d");
  //   //     ctx.clearRect(0, 0, canvas.width, canvas.height)
  //   //     // Face recognition
  //   //     const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
  //   //     results.forEach((result, i) => {
  //   //       const box = resizedDetections[i].detection.box
  //   //       gestureToUser(box, agent)
  //   //       const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
  //   //       drawBox.draw(canvas)
  //   //     })
  //   //   }, 125)}, 5000)

  //     setInterval(async () => {
  //       x = getRandomInt(0, $(window).width() - 150)
  //       y = getRandomInt(0, $(window).height() - 150)
  //       agent.moveTo(x, y);
  //     }, 15000)
  //   })
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
