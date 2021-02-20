define(() => {
	return {
		'postJSON': function(url, data) {
			return this.fetchJSON(url, 'POST', data);
		},

		'putJSON': function(url, data) {
			return this.fetchJSON(url, 'PUT', data);
		},

		'getJSON': function(url) {
			return this.fetchJSON(url, 'GET', null);
		},

		'deleteJSON': function(url) {
			return this.fetchJSON(url, 'DELETE', null);
		},

		'fetchJSON': (url, method, data) => {
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
	};
});
