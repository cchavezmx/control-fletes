import dynamic from 'next/dynamic'

const importJodit = () => import('jodit-react')
const JoditEditor = dynamic(importJodit, {
  ssr: false
})

export default JoditEditor
