import React from 'react'
import Webcam from 'react-webcam'
import { Button, Container, Stack } from '@mui/material'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import Tesseract from 'tesseract.js'

const videoConstraints = {
  width: 330,
  height: 500,
  facingMode: 'user'
}

const WebcamCapture = () => {
  const webcamRef = React.useRef(null)
  const [responseOpenAI, setResponseOpenAI] = React.useState(null)
  const extractTextFromImage = async (imageBase64) => {
    try {
      const {
        data: { text }
      } = await Tesseract.recognize(imageBase64, 'eng')
      console.log('Extracted text:', text)
      fetch('/api/picture-analizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Response from API:', data)
          if (data.error) {
            console.error('Error processing the text:', data.error)
            setResponseOpenAI('Error processing the text, intenta de nuevo')
            return
          }
          setResponseOpenAI(data.response.choices[0].message.content)
        })
      return text
    } catch (error) {
      console.error('Error extracting text:', error)
      return null
    }
  }

  const capture = React.useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot()
    await extractTextFromImage(imageSrc)
  }, [webcamRef])

  return (
    <Container>
      <Stack alignItems="center" marginTop={4}>
        <Webcam
          audio={false}
          height={500}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={330}
          videoConstraints={videoConstraints}
        />
        <Button
          endIcon={<CameraAltIcon />}
          sx={{ marginTop: '20px' }}
          variant="contained"
          onClick={capture}
        >
          Tomar foto
        </Button>
      </Stack>
      <Stack alignItems="center" marginTop={4}>
        {responseOpenAI && <p>{responseOpenAI}</p>}
      </Stack>
    </Container>
  )
}

export default WebcamCapture
