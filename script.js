const video = document.getElementById('video')
const options = new faceapi.TinyFaceDetectorOptions()
const labels = ['codes']


Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', async () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  const labeledFaceDescriptors = await loadLabeledImages()
  const maxDescriptorDistance = 0.6
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)
  console.log('beginning face detection/recognition!')
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      // FACE RECOGNITION
      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))    
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        drawBox.draw(canvas)
      })
      }, 100)
})

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