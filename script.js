$(document).ready(function() {
  run()
})

const mtcnnParams = {
  // number of scaled versions of the input image passed through the CNN
  // of the first stage, lower numbers will result in lower inference time,
  // but will also be less accurate
  maxNumScales: 10,
  // scale factor used to calculate the scale steps of the image
  // pyramid used in stage 1
  scaleFactor: 0.709,
  // the score threshold values used to filter the bounding
  // boxes of stage 1, 2 and 3
  scoreThresholds: [0.6, 0.7, 0.7],
  // mininum face size to expect, the higher the faster processing will be,
  // but smaller faces won't be detected
  // limiting the search space to larger faces for webcam detection
  minFaceSize: 180
}
const options = new faceapi.MtcnnOptions(mtcnnParams)
const videoEl = document.getElementById('inputVideo')


// Promise.all([
//   faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
//   faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
//   faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
//   faceapi.nets.faceExpressionNet.loadFromUri('/models'),
//   faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
// ]).then(startVideo)


async function run() {
  // load the models
  await faceapi.loadMtcnnModel('/models')
  await faceapi.loadFaceRecognitionModel('/models')
  // await faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  // await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')

  // try to access users webcam and stream the images
  // to the video element
  navigator.getUserMedia(
    { video: {} },
    stream => videoEl.srcObject = stream,
    err => console.error(err)
    )
  }
  
  // run()
  
  async function onPlay() {
    console.log('loading...')
    const displaySize = { width: videoEl.width, height: videoEl.height }
    const canvas = faceapi.createCanvasFromMedia(videoEl)
    document.body.append(canvas)
    var ctx = canvas.getContext('2d'); 
    ctx.font = "30px Arial";
    ctx.fillText("Please wait!face-api.js is loading the MTCNN model for face detection/recognition in your browser!", canvas.height / 2, canvas.width / 2);
    // setInterval(async () => {
      const mtcnnResults = await faceapi.mtcnn(videoEl, mtcnnParams)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      faceapi.draw.drawFaceLandmarks(canvas, mtcnnResults.map(res => res.landmarks), { lineWidth: 4, color: 'red' })
      faceapi.draw.drawDetections(canvas, mtcnnResults.map(res => res.detection), { withScore: false })
      
      // const fullFaceDescriptions = await faceapi.detectAllFaces(inputVideo, options).withFaceLandmarks().withFaceDescriptors()
      // const fullFaceDescriptions = await faceapi.detectAllFaces(inputVideo, options).withFaceLandmarks().withFaceDescriptors()
      // console.log(mtcnnResults.map(res => res))
      // console.log(fullFaceDescriptions)


      // const alignedFaceBoxes = mtcnnResults.map(
      //   ({ landmarks }) => landmarks.align()
      // )

      // const alignedFaceTensors = await faceapi.extractFaceTensors(canvas, alignedFaceBoxes)
      
      // const descriptors = await Promise.all(alignedFaceTensors.map(
      //   faceTensor => faceapi.computeFaceDescriptor(faceTensor)
      // ))
      
      // // free memory
      // alignedFaceTensors.forEach(t => t.dispose())

      // console.log(alignedFaceTensors)
      // Face recognition!

      // const labels = ['codes']
      
      // const labeledFaceDescriptors = await Promise.all(
      //   labels.map(async label => {
      //     // fetch image data from urls and convert blob to HTMLImage element
      //     const imgUrl = `/labeled_images/codes/${label}.jpg`
      //     const img = await faceapi.fetchImage(imgUrl)

      //     // detect the face with the highest score in the image and compute it's landmarks and face descriptor
      //     const fullFaceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks()
      //     // const fullFaceDescription = await faceapi.detectSingleFace(img, options).withFaceLandmarks().withFaceDescriptor()
          
      //     if (!fullFaceDescription) {
      //       throw new Error(`no faces detected for ${label}`)
      //     }
          
      //     const faceDescriptors = [fullFaceDescription.descriptor]
      //     return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
      //   })
      // )
      
      // // 0.6 is a good distance threshold value to judge
      // // whether the descriptors match or not
      // const maxDescriptorDistance = 0.6
      // const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)
      
      // const results = fullFaceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor))

      // results.forEach((bestMatch, i) => {
      //   const box = fullFaceDescriptions[i].detection.box
      //   const text = bestMatch.toString()
      //   const drawBox = new faceapi.draw.DrawBox(box, { label: text })
      //   drawBox.draw(canvas)
      // })

      // setTimeout(() => onPlay(videoEl))
    // }, 100)
  }

