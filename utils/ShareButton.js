import { Button } from '@mui/material'

const emoticones = ["π", "π₯Ά", "π", "π", "π·", "π»", "π¦", "β€οΈ", "π½", "πΎ", "π", "π§Ά", "ππ»ββοΈππ»ββοΈ"]

const ShareButton = ({ id, type, title }) => {
  const shareData = {
    title,
    text: `Esta url es ΓΊnica y puedes consultarla las veces que necesites ${emoticones[Math.floor(Math.random() * emoticones.length)]}`,
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