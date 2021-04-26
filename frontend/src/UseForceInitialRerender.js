import {useState, useLayoutEffect} from 'react'

const useForceInitialRerender = () => {
  // eslint-disable-next-line no-unused-vars
  const [ignored, setUpdated] = useState(false)
  useLayoutEffect(() => setUpdated(true), [true])
}

export default useForceInitialRerender
