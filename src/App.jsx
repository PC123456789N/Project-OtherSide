import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)
  return (
      <>
      <Header />

      <div className="flex justify-center gap-6 mt-10">
        <Button texto="Campo-1" />
        <Button texto="Campo-2" />
        <Button texto="Campo-3" />
        <Button texto="Campo-4" />
      </div>
    </>
  )
}

export default App