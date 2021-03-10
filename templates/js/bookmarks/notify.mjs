export function message(textHtml) {
	let id = 'toast-' + Date.now();
	let html = '<div id="' + id + '" class="w-96 max-w-full text-sm pointer-events-auto bg-clip-padding shadow rounded bg-green-500 text-white p-3" role="alert" aria-live="assertive" aria-atomic="true"></div>';
	$('#toast-container').append($.parseHTML(html));
	let el = $('#' + id);
	el.html(textHtml)
		.on('hidden.bs.toast', () => {
			el.remove();
		});
	new bootstrap.Toast(el[0]).show();
}
