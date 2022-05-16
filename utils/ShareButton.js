import { Button } from '@mui/material'

const ShareButton = ({ id, type }) => {
  const shareData = {
    title: "Flotilla",
    text: 'Recurso de logistica',
    url: `https://logistica-sage.vercel.app/flotilla/${id}/${type}`,
  }

  const handleShare = async() => {
    try{
      await navigator.share(shareData)    
    }catch(error){
      console.log(error)
    }
  }
  
  return <Button variant='contained' color="secondary" onClick={handleShare}>
    Compartir
  </Button>
}

export default ShareButton