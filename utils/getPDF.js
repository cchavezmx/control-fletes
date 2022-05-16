import { saveAs } from 'file-saver'
const API = process.env.NEXT_PUBLIC_API

const pdfCreator = ({ id, type }) => {
  // preview pdf blob data
  fetch(`${API}/flotilla/plan/print/${id}?type=${type.trim().toLowerCase()}`, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  }).then(res => {
    return res
      .arrayBuffer()
      .then(res => {
        const blob = new Blob([res], { type: 'application/pdf' })
        saveAs(blob, `${type} - ${id}.pdf`)
      })
      .catch(error => console.log(error))
  })
}

export default pdfCreator