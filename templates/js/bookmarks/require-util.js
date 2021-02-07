function requirePromise(modules) {
	return new Promise(resolve => {
		if (typeof(modules) === 'string') {
			require([modules], m => {
				resolve(m);
			});
		} else {
			require(modules, function() {
				resolve(arguments);
			});
		}
	});
}
