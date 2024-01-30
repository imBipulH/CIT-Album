
import { useEffect, useState, useRef } from 'react'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll
} from 'firebase/storage'

function App () {
  const [file, setFile] = useState()
  const [files, setFiles] = useState()
  const fileInputRef = useRef(null)
  const [progress, setProgress] = useState()
  // console.log(file.name)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const storageRef = ref(storage, 'images/')
        const imageList = await listAll(storageRef)
        const urls = []
        for (const item of imageList.items) {
          const url = await getDownloadURL(item)
          urls.push(url)
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        setFiles(urls)
      } catch (error) {
        console.log(error)
      }
    }
    fetchImages()
  })

  const storage = getStorage()
  const metadata = { contentType: 'image/jpeg' }

  const handleUpload = () => {
    const storageRef = ref(storage, 'images/' + `${file ? file.name : file}`)
    const uploadTask = uploadBytesResumable(storageRef, file, metadata)

    uploadTask.on(
      'state_changed',
      snapshot => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        const roundedprogress = Math.round(progress*10)/10
        setProgress(roundedprogress)
        console.log('Upload is ' + progress + '% done')
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused')
            break
          case 'running':
            console.log('Upload is running')
            break
        }
      },
      error => {
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break
          case 'storage/canceled':
            // User canceled the upload
            break

          // ...

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break
        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
          console.log('File available at', downloadURL)
        })
      }
    )
    fileInputRef.current.value = ''
    setFile(null)
  }

  return (
    <>
      <div className='bg-aqua p-6 container mx-auto h-screen'>
        <h1 className='text-center text-3xl text-teal'>CIT Album</h1>
          <p className='text-center mt-6 mb-4'>{progress ? `Upload is ${progress}% done.`: `Click "Choose File" and select an image.`}</p>

        <div className='flex justify-center mb-6'>
          <input
            ref={fileInputRef}
            onChange={e => setFile(e.target.files[0])}
            type='file'
            className=''
          />
          <button
            onClick={handleUpload}
            className='bg-white px-2 py-1 rounded-md'
          >
            Upload
          </button>
        </div>

        <div className='flex gap-2 flex-wrap'>
          {files &&
            files.map((url, index) => (
              <div className='h-full w-40 border border-white p-1' key={index}>
                <img src={url} className='max-w-40 h-full items-baseline' />
              </div>
            ))}
        </div>
      </div>
    </>
  )
}

export default App
