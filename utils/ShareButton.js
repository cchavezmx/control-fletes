import { Button } from '@mui/material'

const ShareButton = ({ id, type, title }) => {
  const shareData = {
    title,
    text: 'Esta url es única y puedes consultarla las veces que necesites 😁',
    url: `https://control-fletes.vercel.app/flotilla/${id}/${type}`,
  }

  const handleShare = async() => {
    try{
      await navigator.share(shareData)    
    }catch(error){
      console.log(error)
    }
  }
  
  return <Button variant='contained' color="secondary" onClick={handleShare}>
    Enviar
  </Button>
}

export default ShareButton