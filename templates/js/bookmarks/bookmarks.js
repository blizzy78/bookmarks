(() => {
	async function search() {
		let query = $('#search-form :input[name="q"]').val();
		if (query === '') {
			return;
		}

		let rID = ++requestID;
		let fetchUtil = await requirePromise('fetch-util');
		let res = await fetchUtil.getJSON('/rest/bookmarks?q=' + encodeURIComponent(query) + '&requestID=' + rID);
		if (res.requestID <= responseID) {
			return;
		}

		responseID = res.requestID;
		updateHits(res.hits);
	}

	function updateHits(hits) {
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
			.classed('entry-title', true);

		// title link
		title.append('a')
			.classed('entry-link', true)
			.attr('href', h => h.url)
			.text(h => h.title);

		// title edit link
		let titleEditLink = title.append('a')
			.classed('edit-link px-2 ms-2', true)
			.attr('role', 'button')
			.attr('title', 'Edit')
			.on('click', (e, h) => {
				editBookmark(h.id);
			});
		titleEditLink.append('i')
			.classed('fas fa-edit', true);

		// URL
		entry.append('div')
			.classed('entry-url', true)
			.append('a')
				.classed('entry-link', true)
				.attr('href', h => h.url)
				.text(h => h.url);

		// description
		entry.append('div')
			.classed('entry-description', true)
			.text(h => h.description);

		// prepare tags data
		let hitsTags = hits
			.filter(h => typeof(h.tags) !== 'undefined' && h.tags !== null && h.tags.length > 0)
			.map(h => {
				return {
					'id': h.id,
					'tags': h.tags,
					'isTags': true
				};
			});

		// tags
		entry.append('div')
			.classed('entry-tags', true)
			.selectAll('a')
			.data(h => h.tags)
			.join(
				enter => enter.append('a')
					.classed('badge bg-info me-1', true)
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

		let [fetchUtil, notify] = await requirePromise(['fetch-util', 'notify']);
		if (id !== '') {
			await fetchUtil.putJSON('/rest/bookmarks/' + id, req);
		} else {
			await fetchUtil.postJSON('/rest/bookmarks', req);
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

		notify.message('Bookmark saved.');
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
			buttonEl.removeClass('d-none');
		} else {
			buttonEl.addClass('d-none');
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
		$('#add-bookmark-dialog .modal-title').text('Edit Bookmark');
		$('#add-bookmark-dialog').modal('show');
	}

	function getBookmark(id) {
		return requirePromise('fetch-util')
			.then(fetchUtil => fetchUtil.getJSON('/rest/bookmarks/' + id));
	}

	async function deleteBookmark() {
		if (window.confirm('Delete this bookmark?')) {
			let formEl = $('#add-bookmark-dialog-add-form');
			let id = formEl.find(':input[name="id"]').val();
			$('#add-bookmark-dialog').modal('hide');
			let [fetchUtil, notify] = await requirePromise(['fetch-util', 'notify']);
			await fetchUtil.deleteJSON('/rest/bookmarks/' + id)
			notify.message('Bookmark deleted.');
			search();
		}
	}

	let requestID = 0;
	let responseID = 0;

	define(['fetch-util', 'notify'], () => {
		return {
			'init': () => {
				$(() => {
					$('#search-form :input[name="q"]')
						.keyup(search)
						.on('search', search);

					$('#add-bookmark-button').click(() => {
						clearAddBookmarkDialog();
						$('#add-bookmark-dialog .modal-title').text('New Bookmark');
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
			}
		};
	});
})();
