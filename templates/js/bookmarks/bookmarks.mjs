import * as FetchUtil from './fetch-util.mjs';
import * as Notify from './notify.mjs';

async function search() {
	let queryField = $('#search-form :input[name="q"]');
	let query = queryField.val();
	if (query === '') {
		queryField.removeClass('is-invalid');
		return;
	}

	let rID = ++requestID;
	let res = await FetchUtil.getJSON('/rest/bookmarks?q=' + encodeURIComponent(query) + '&requestID=' + rID);
	if (res.requestID <= responseID) {
		return;
	}
	responseID = res.requestID;

	if (res.error) {
		queryField.addClass('is-invalid');
	} else {
		queryField.removeClass('is-invalid');
	}

	updateHits(res.hits, res.totalHits, res.error);
}

function updateHits(hits, totalHits, error) {
	let results = d3.select('#results');

	let entry = results.selectAll('div.entry')
		.data(hits, h => h ? h.id : $(h).data('entry'))
		.join(
			enter => enter.append('div')
				.attr('data-entry', h => h.id),
			update => {
				$(update.nodes()).empty();
				return update;
			});

	entry.classed('entry mb-4', true);

	// title
	let title = entry.append('div')
		.classed('text-xl', true);

	// title link
	title.append('a')
		.classed('text-blue-600', true)
		.attr('href', h => h.url)
		.html(h => h.titleHTML);

	// title edit link
	let titleEditLink = title.append('a')
		.classed('edit-link text-transparent ml-2', true)
		.attr('role', 'button')
		.attr('title', 'Edit')
		.on('click', (e, h) => {
			editBookmark(h.id);
		});
	titleEditLink.append('i')
		.classed('fas fa-edit', true);

	// URL
	entry.append('div')
		.classed('text-sm', true)
		.append('a')
			.classed('text-green-600', true)
			.attr('href', h => h.url)
			.html(h => h.urlHTML);

	// description
	entry.append('div')
		.html(h => h.descriptionHTML);

	// tags
	entry.append('div')
		.classed('text-xs leading-8', true)
		.selectAll('a')
		.data(h => h.tags)
		.join(
			enter => enter.append('a')
				.classed('mr-2 py-1 px-2 rounded bg-green-500 text-white', true)
				.attr('role', 'button')
				.text(t => t)
				.on('click', (e, t) => {
					let queryEl = $('#search-form :input[name="q"]');
					queryEl.val(queryEl.val() + ' tags:"' + t + '"');
					search();
				})
		);
}

async function saveBookmark() {
	let formEl = $('#add-bookmark-dialog-add-form');
	let id = formEl.find(':input[name="id"]').val();
	let url = formEl.find(':input[name="url"]').val();
	let title = formEl.find(':input[name="title"]').val();
	let description = formEl.find(':input[name="description"]').val();
	let tags = formEl.find('#tags').tagging('getTags');

	let req = {
		'url': url,
		'title': title,
		'description': description,
		'tags': tags
	};

	if (id !== '') {
		await FetchUtil.putJSON('/rest/bookmarks/' + id, req);
	} else {
		await FetchUtil.postJSON('/rest/bookmarks', req);
	}

	let dialog = $('#add-bookmark-dialog');

	if (dialog.data('search-again-on-save') === true) {
		search();
	}

	if (dialog.data('close-on-save') === true) {
		dialog.modal('hide');
	} else {
		clearAddBookmarkDialog();
	}

	Notify.message('Bookmark saved.');
	formEl.find(':input[name="url"]').focus();
}

function clearAddBookmarkDialog() {
	let formEl = $('#add-bookmark-dialog-add-form');
	formEl.find(':input[name="id"]').val('');
	formEl.find(':input[name="url"]').val('');
	formEl.find(':input[name="title"]').val('');
	formEl.find(':input[name="description"]').val('');
	formEl.find('#tags').tagging('reset');
	let dialog = $('#add-bookmark-dialog');
	dialog.data('close-on-save', false);
	dialog.data('search-again-on-save', false);
	setDeleteButtonVisible(false);
}

function setDeleteButtonVisible(visible) {
	let buttonEl = $('#add-bookmark-dialog-delete-button');
	if (visible) {
		buttonEl.removeClass('hidden');
	} else {
		buttonEl.addClass('hidden');
	}
}

async function editBookmark(id) {
	let entry = await getBookmark(id);

	clearAddBookmarkDialog();

	let formEl = $('#add-bookmark-dialog-add-form');
	formEl.find(':input[name="id"]').val(id);
	formEl.find(':input[name="url"]').val(entry.url);
	formEl.find(':input[name="title"]').val(entry.title);
	formEl.find(':input[name="description"]').val(entry.description);
	let tagsEl = formEl.find('#tags');
	tagsEl.tagging('reset');
	tagsEl.tagging('add', entry.tags);

	let dialog = $('#add-bookmark-dialog');
	dialog.data('close-on-save', true);
	dialog.data('search-again-on-save', true);

	setDeleteButtonVisible(true);
	$('#add-bookmark-dialog-title').text('Edit Bookmark');
	$('#add-bookmark-dialog').modal('show');
}

async function getBookmark(id) {
	return FetchUtil.getJSON('/rest/bookmarks/' + id);
}

async function deleteBookmark() {
	if (window.confirm('Delete this bookmark?')) {
		let formEl = $('#add-bookmark-dialog-add-form');
		let id = formEl.find(':input[name="id"]').val();
		$('#add-bookmark-dialog').modal('hide');
		await FetchUtil.deleteJSON('/rest/bookmarks/' + id)
		Notify.message('Bookmark deleted.');
		search();
	}
}

let requestID = 0;
let responseID = 0;

$(() => {
	$('#search-form :input[name="q"]')
		.keyup(search)
		.on('search', search);

	$('#add-bookmark-button').click(() => {
		clearAddBookmarkDialog();
		$('#add-bookmark-dialog-title').text('New Bookmark');
		$('#add-bookmark-dialog').modal('show');
	});

	$('#add-bookmark-dialog').on('shown.bs.modal', () => {
		$('#add-bookmark-dialog-add-form :input[name="url"]').focus();
	});

	$("#add-bookmark-dialog-add-form #tags").tagging({
		'edit-on-delete': false
	});

	$('#add-bookmark-dialog-add-button').click(saveBookmark);
	$('#add-bookmark-dialog-delete-button').click(deleteBookmark);

	let q = $('#search-form :input[name="q"]').val();
	if (q !== '') {
		search();
	}
});
