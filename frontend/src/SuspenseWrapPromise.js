export default function suspenseWrapPromise(promise) {
  let status = 'pending'
  let result

  let suspender = promise.then(
    r => {
      status = 'success'
      result = r
    },
    e => {
      status = 'error'
      result = e
    }
  )

  return () => {
    if (status === 'pending') {
      throw suspender
    }
    if (status === 'error') {
      throw result
    }
    return result
  }
}
