const video = document.getElementById('video')
const options = new faceapi.TinyFaceDetectorOptions()
var bulbOn = false;
const labels = ['codes']

var grammar =
  "#JSGF V1.0; grammar emar; public <greeting> = hello | hi; <person> = codes | alisa;";
var recognition = new window.webkitSpeechRecognition();
var speechRecognitionList = new window.webkitSpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

recognition.start();
console.log('recognition started!')


recognition.onresult = processSpeech;
recognition.onend = recognitionEnded;

function processSpeech(event) {
  let transcript = event.results[0][0].transcript.toLowerCase().split(' ');
  console.log('speech processing...' + transcript)
  if (transcript.includes('clippy')) {
    console.log('CLIPPY DETECTED');
  }
  recognition.stop();
  return transcript
}

function recognitionEnded() {
  // start the recognition again for the next input
  recognition.start();
}

clippy.load('Clippy', function(agent){
  agent.show()
  agent.moveTo($(window).width()/2, $(window).height()/2)
  // agent.moveTo(300,300)
  // agent.animate('DontRecognize')
  agent.speak('Loading neural nets into your browser; this can take upwards of 30 seconds!')
  setTimeout( function() {
    loadNetworks();
    agent.hide();
  }, 5000)
})

async function loadNetworks(){
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
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
    agent.speak('Almost done! Please ensure you have webcam/microphone access allowed and full screen this site!');
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
          // Draw lightbulb
          let img = lightbulbState(box, result)
          ctx.drawImage(img, box.x + (box.width - img.width) / 2, box.y - img.height);
          const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
          drawBox.draw(canvas)
        })
      }, 125)}, 5000)

      setInterval(async () => {
        agent.animate();
        // agent.speak('hello, world! how are you doing today? I am good!');
      }, 10000)
      setInterval(async () => {
        x = getRandomInt(0, $(window).width())
        y = getRandomInt(0, $(window).height())
        console.log
        agent.moveTo(x, y);
      }, 15000)
      
    })
  })

function lightbulbState(box, result) {
  let name = result.toString().split(' ')[0]
  if (name == 'codes') {
    bulbOn = true;
  } else {
    bulbOn = false;
  }
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
      const imgUrl = `/labeled_images/codes/${label}.jpg`
      const img = await faceapi.fetchImage(imgUrl)    
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
      descriptions.push(detections.descriptor)
      console.log('face recognition labeled images loaded!')
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}