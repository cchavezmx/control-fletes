import OpenAIApi from 'openai'

const openai = new OpenAIApi({
  apiKey: process.env.OPEN_IA_KEY,
  project: process.env.OPEN_IA_PROJECT
})

export default async function handler (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text } = req.body
  console.log('Text received:', text)

  if (!text) {
    return res.status(400).json({ error: 'No text provided' })
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content:
            'puedes ayudarme a indentificar el numero de guia de una imagen que previamente ya transforme en texto puede ser dhl, fedex, estafeta, etc. el texto es el siguiente:' +
            text
        }
      ],
      response_format: {
        type: 'text'
      },
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    })
    res.status(200).json({ response })
  } catch (error) {
    console.error('Error interacting with OpenAI API:', error)
    res.status(500).json({ error: 'Failed to process the text' })
  }
}
