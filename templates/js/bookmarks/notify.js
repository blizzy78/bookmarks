define(() => {
	return {
		'message': textHtml => {
			let id = 'toast-' + Date.now();
			let html = '<div id="' + id + '" class="toast bg-success text-light" role="alert" aria-live="assertive" aria-atomic="true">' +
				'<div class="toast-body">' +
				textHtml +
				'</div>' +
				'</div>';
			$('.toast-container').append($.parseHTML(html));
			let el = $('#' + id);
			el.on('hidden.bs.toast', () => {
				el.remove();
			});
			new bootstrap.Toast(el[0]).show();
		}
	};
});
