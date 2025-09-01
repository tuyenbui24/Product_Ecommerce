import { useState } from 'react'

function App() {
  const [data, setData] = useState({
    name: "tuyến",
    sdt: "090909090",
    address: "hn"
  })

  const handleChange = () => {
    setData({
      ...data,
      name: "tuyến 2",
      favorite: "jdk"
    })
  }

  return (
    <div className="text-4xl font-bold text-blue-500 bg-gray-100 p-4">
      <h1>{JSON.stringify(data)}</h1>
      <button  
        onClick={handleChange}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        Change
      </button>
    </div>
  )
}

export default App
