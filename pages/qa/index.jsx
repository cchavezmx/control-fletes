import QABoard from '@/components/qa/QABoard'

// Vista: tablero QA estilo monday.com — sin auth, sin backend.
// Montada en /qa; queda fuera del Layout autenticado para que se pueda
// previsualizar como playground sin login.
export default function QAPage () {
  return <QABoard />
}
