// pages/api/paqueteria.js
export default async function handler (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch(
      `${process.env.PDF_SERVICE_URL}/reporte/paqueteria`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      }
    )

    if (!response.ok) {
      throw new Error('Error al generar el PDF')
    }

    // Configurar headers para la respuesta como PDF
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=recibo.pdf')

    // Leer y enviar el stream del PDF
    const pdfBuffer = await response.arrayBuffer()
    res.send(Buffer.from(pdfBuffer))
  } catch (error) {
    console.error('Error al generar el PDF:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
