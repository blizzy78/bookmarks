export async function postJSON(url, data) {
	return fetchJSON(url, 'POST', data);
}

export async function putJSON(url, data) {
	return fetchJSON(url, 'PUT', data);
}

export async function getJSON(url) {
	return fetchJSON(url, 'GET', null);
}

export async function deleteJSON(url) {
	return fetchJSON(url, 'DELETE', null);
}

export async function fetchJSON(url, method, data) {
	let reqData = {
		'method': method,
		'cache': 'no-cache',
		'headers': {
			'Content-Type': 'application/json'
		}
	};
	if (typeof(data) !== 'undefined' && data !== null) {
		reqData.body = JSON.stringify(data);
	}

	return fetch(url, reqData)
		// 204 No Content
		.then(response => response.status !== 204 ? response.json() : null);
}
