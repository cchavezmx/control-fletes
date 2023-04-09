// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getStorage, ref, listAll, getDownloadURL, uploadBytes } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDQlTL8zvk6DcHpQFqVSypYmj7hZUkBx7I',
  authDomain: 'itacatalgo.firebaseapp.com',
  projectId: 'itacatalgo',
  storageBucket: 'itacatalgo.appspot.com',
  messagingSenderId: '543664139030',
  appId: '1:543664139030:web:86a26fa7848090bc69fe37'
}

const UoploadFileCatalogo = `
  mutation UploadFileCatalogo($catalogo: catalogoInput) {
    uploadFileCatalogo(catalogo: $catalogo)
  }
`

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

const refImage = ref(storage, '/')
// get all files from storage
export const allList = listAll(refImage)

// get all files url from storage
const image = (name) => getDownloadURL(ref(storage, `/${name}`))
  .then((url) => {
    return url
  })
  .catch((error) => {
    // Handle any errors
    console.log(error)
  })

export const getUrlByName = async (name) => {
  if (name === '') return

  const url = await image(name)
  return url
}

// add new file to storage
export const addFile = async (file, name) => {
  const blob = new Blob([file], { type: 'application/pdf' })
  return uploadBytes(ref(storage, `/${name}`), blob).then(async (snapshot) => {
    const varriables = {
      catalogo: {
        url: await getUrlByName(name),
        name
      }
    }

    await fetch('https://graphql-api-production.up.railway.app/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: UoploadFileCatalogo,
        variables: varriables
      })
    })

    return 'Archivo subido'
  })
}
