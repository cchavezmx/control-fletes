import { Button } from '@mui/material'
const emoticones = ['🚀', '🥶', '😁', '🙈', '📷', '🍻', '🦜', '❤️', '👽', '👾', '🐑', '🧶', '🏃🏻‍♂️🏃🏻‍♂️']

const ShareButton = ({ id, type, title }) => {
  const shareData = {
    title,
    text: `Esta url es única y puedes consultarla las veces que necesites ${emoticones[Math.floor(Math.random() * emoticones.length)]}`,
    url: `https://control-fletes.vercel.app/flotilla/${id}/${type}`
  }

  const handleClick = () => {
    const subject = encodeURIComponent('Control de Fletes: ' + shareData.title)
    const body = encodeURIComponent(shareData.text + '\n' + shareData.url)
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`
    window.open(gmailLink, '_blank')
  }

  return <Button variant='contained' color="secondary" onClick={handleClick}>
    Enviar
  </Button>
}

export default ShareButton
