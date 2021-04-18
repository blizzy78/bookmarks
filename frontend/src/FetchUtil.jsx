export function postJSON(url, data) {
  return fetchJSON(url, 'POST', data)
}

export function putJSON(url, data) {
  return fetchJSON(url, 'PUT', data)
}

export function getJSON(url) {
  return fetchJSON(url, 'GET', null)
}

export function deleteJSON(url) {
  return fetchJSON(url, 'DELETE', null)
}

export function fetchJSON(url, method, data) {
  // eslint-disable-next-line no-undef
  if (process.env.NODE_ENV === 'development') {
    url = 'http://localhost:8080' + url
  }

  let reqData = {
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
