import { useEffect, useState, useRef } from 'react'
import GridLoader from 'react-spinners/GridLoader'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject
} from 'firebase/storage'

function App () {
  const [file, setFile] = useState();
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [progress, setProgress] = useState();
  const [name, setName] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const storageRef = ref(storage, 'images/')
        const imageList = await listAll(storageRef)
        const urls = []
        for (const item of imageList.items) {
          const url = await getDownloadURL(item)
          if (item.name.includes('|')) {
            const username = item.name.split('|')[0]
            urls.push({ url, username, ref: item })
          } else {
            urls.push({ url, ref: item })
          }
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        setFiles(urls)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setLoading(false)
      }
    }
    fetchImages()
  })

  const storage = getStorage()
  const metadata = { contentType: 'image/jpeg' }

  const handleUpload = () => {
    const storageRef = ref(
      storage,
      'images/' + `${name}|${file ? file.name : file}`
    )
    const uploadTask = uploadBytesResumable(storageRef, file, metadata)
    uploadTask.on(
      'state_changed',
      snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        const roundedprogress = Math.round(progress * 10) / 10
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
            console.log("User doesn't have permission to access the object")
            break
          case 'storage/canceled':
            console.log('User canceled the upload')
            break
          case 'storage/unknown':
            console.log('Unknown error occurred, inspect error.serverResponse')
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

  const handleDelete = async item => {
    console.log(item)
    try {
      await deleteObject(item.ref) // Delete the object from storage
      setFiles(prevFiles => prevFiles.filter(file => file.url !== item.url)) // Remove the deleted item from state
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className='bg-aqua p-6 container mx-auto h-screen'>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        {loading && <GridLoader color='#fff' margin={2} size={30} />}
        </div>
        <h1 className='text-center text-3xl text-teal'>
          CIT Album<span className='text-sm'>0.1</span>
        </h1>
        <p className='text-center mt-6 mb-4'>
          {progress
            ? `Upload is ${progress}% done.`
            : `Click "Choose File" and select an image.`}
        </p>
        <div className='flex gap-4 flex-wrap justify-center mb-6'>
          <div className='flex gap-2 items-center'>
            <p className=''>Uploaded by:</p>
            <input
              onChange={e => setName(e.target.value)}
              type='text'
              placeholder='Name (required)'
              className='p-1 text-sm outline-none'
            />
          </div>
          <div>
            <input
              ref={fileInputRef}
              onChange={e => setFile(e.target.files[0])}
              type='file'
              className='text-sm'
            />
            <button
              onClick={file && name ? handleUpload : null}
              className={`bg-white px-2 py-1 text-sm rounded-sm ${
                !name || !file ? 'cursor-not-allowed' : ''
              }`}
            >
              Upload
            </button>
          </div>
        </div>

        <div className='flex gap-2 flex-wrap'>
          {files &&
            files.map((url, index) => (
              <div
                className='group h-full w-40 border relative border-white p-1'
                key={index}
              >
                <p
                  onClick={() => handleDelete(url)}
                  className='absolute right-0 text-white text-sm bg-red-500 leading-3 px-2 py-1 rounded-sm cursor-pointer group-hover:block hidden'
                >
                  x
                </p>
                <img
                  src={url.url}
                  className='max-w-40 h-full items-baseline group'
                />
                <p className='text-sm text-teal-900'>
                  {url.username && url.username}
                </p>
              </div>
            ))}
        </div>
        <div className='flex justify-center'>
          <p className='fixed bottom-4 text-xl text-center text-teal-900'>
            This is a simple web app to upload your files to a web server from
            your smartdevice. This has been created for learning purpose. Thank
            you!
          </p>
        </div>
      </div>
    </>
  )
}

export default App
