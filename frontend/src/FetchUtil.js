const getJSON = url => fetchJSON(url, 'GET', null)
const postJSON = (url, data) => fetchJSON(url, 'POST', data)
const putJSON = (url, data) => fetchJSON(url, 'PUT', data)
const deleteJSON = url => fetchJSON(url, 'DELETE', null)

const fetchJSON = (url, method, data) => {
  // eslint-disable-next-line no-undef
  if (process.env.NODE_ENV === 'development') {
    url = 'http://localhost:8080' + url
  }

  const reqData = {
    method: method,
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  if (typeof (data) !== 'undefined' && data !== null) {
    reqData.body = JSON.stringify(data)
  }

  return fetch(url, reqData)
    // 204 No Content
    .then(response => response.status !== 204 ? response.json() : null)
}

export {postJSON, putJSON, getJSON, deleteJSON, fetchJSON}
