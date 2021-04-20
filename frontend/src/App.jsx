import React, { Suspense } from 'react'
import Section from './Section'
import SearchForm from './SearchForm'
import DarkModeSwitch from './DarkModeSwitch'
import * as FetchUtil from './FetchUtil'
import suspenseWrapPromise from './SuspenseWrapPromise'
import loadable from '@loadable/component'

const SearchResults = loadable(() => import('./SearchResults'))
const BookmarkDialog = loadable(() => import('./BookmarkDialog'))

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.queryRef = React.createRef()
    this.bookmarkDialogRef = React.createRef()

    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.handleTagClick = this.handleTagClick.bind(this)
    this.handleEntryEditClick = this.handleEntryEditClick.bind(this)
    this.handleEntryEditMouseOver = this.handleEntryEditMouseOver.bind(this)

    this.handleNewBookmark = this.handleNewBookmark.bind(this)
    this.handleNewBookmarkMouseOver = this.handleNewBookmarkMouseOver.bind(this)
    this.hideBookmarkDialog = this.hideBookmarkDialog.bind(this)
    this.handleBookmarkDialogURLChange = this.handleBookmarkDialogURLChange.bind(this)
    this.handleBookmarkDialogTitleChange = this.handleBookmarkDialogTitleChange.bind(this)
    this.handleBookmarkDialogDescriptionChange = this.handleBookmarkDialogDescriptionChange.bind(this)
    this.handleBookmarkDialogTagsChange = this.handleBookmarkDialogTagsChange.bind(this)
    this.handleBookmarkDialogSave = this.handleBookmarkDialogSave.bind(this)
    this.handleBookmarkDialogDelete = this.handleBookmarkDialogDelete.bind(this)

    this.state = {
      query: '',
      results: null,
      oldResults: null,
      error: false,

      bookmarkDialogOpen: false,
      bookmarkDialogID: null,
      bookmarkDialogURL: '',
      bookmarkDialogTitle: '',
      bookmarkDialogDescription: '',
      bookmarkDialogTags: []
    }
    this.requestID = 0
  }

  async handleQueryChange(query) {
    this.setState({query: query})
    SearchResults.preload()

    if (query === '') {
      this.setState({results: null, error: false})
      return
    }

    let reqID = ++this.requestID
    let res = FetchUtil.getJSON('/rest/bookmarks?q=' + encodeURIComponent(query) + '&requestID=' + reqID)
    let results = suspenseWrapPromise(res)
    res.then(r => {
      this.setState({error: r.error,  oldResults: results})
    })
    this.setState({results: results})
  }

  handleTagClick(tag) {
    this.handleQueryChange(this.state.query + ' tags:"' + tag + '"')
  }

  async handleEntryEditClick(id) {
    let bookmark = await FetchUtil.getJSON('/rest/bookmarks/' + id)
    this.setState({
      bookmarkDialogOpen: true,
      bookmarkDialogID: id,
      bookmarkDialogURL: bookmark.url,
      bookmarkDialogTitle: bookmark.title,
      bookmarkDialogDescription: bookmark.description,
      bookmarkDialogTags: bookmark.tags.map(t => {return {name: t}})
    })
  }

  handleEntryEditMouseOver() {
    BookmarkDialog.preload()
  }

  handleNewBookmark() {
    this.setState({
      bookmarkDialogOpen: true,
      bookmarkDialogID: null,
      bookmarkDialogURL: '',
      bookmarkDialogTitle: '',
      bookmarkDialogDescription: '',
      bookmarkDialogTags: []
    })
  }

  handleNewBookmarkMouseOver() {
    BookmarkDialog.preload()
  }

  hideBookmarkDialog() {
    this.setState({bookmarkDialogOpen: false})
  }

  handleBookmarkDialogURLChange(e) {
    this.setState({bookmarkDialogURL: e.target.value})
  }

  handleBookmarkDialogTitleChange(e) {
    this.setState({bookmarkDialogTitle: e.target.value})
  }

  handleBookmarkDialogDescriptionChange(e) {
    this.setState({bookmarkDialogDescription: e.target.value})
  }

  handleBookmarkDialogTagsChange(tags) {
    this.setState({bookmarkDialogTags: tags})
  }

  async handleBookmarkDialogSave() {
    let req = {
      'url': this.state.bookmarkDialogURL,
      'title': this.state.bookmarkDialogTitle,
      'description': this.state.bookmarkDialogDescription,
      'tags': this.state.bookmarkDialogTags.map(t => t.name)
    }

    let id = this.state.bookmarkDialogID
    if (id !== null) {
      this.hideBookmarkDialog()
      await FetchUtil.putJSON('/rest/bookmarks/' + id, req)
      this.handleQueryChange(this.state.query)
    } else {
      this.resetBookmarkDialog()
      await FetchUtil.postJSON('/rest/bookmarks', req)
    }
  }

  async handleBookmarkDialogDelete() {
    if (!window.confirm('Delete bookmark?')) {
      return
    }

    let id = this.state.bookmarkDialogID
    this.hideBookmarkDialog()
    await FetchUtil.deleteJSON('/rest/bookmarks/' + id)
    this.handleQueryChange(this.state.query)
  }

  resetBookmarkDialog() {
    this.setState({
      bookmarkDialogID: null,
      bookmarkDialogURL: '',
      bookmarkDialogTitle: '',
      bookmarkDialogDescription: '',
      bookmarkDialogTags: []
    })
    this.bookmarkDialogRef.current.resetFocus()
  }

  componentDidMount() {
    this.queryRef.current.focus()
  }

  render() {
    return <>
      <Section className="mb-5">
        <SearchForm query={this.state.query} queryRef={this.queryRef} onQueryChange={this.handleQueryChange}
          onNewBookmark={this.handleNewBookmark} onNewBookmarkMouseOver={this.handleNewBookmarkMouseOver}
          error={this.state.error}/>
      </Section>

      {
        this.state.results !== null && !this.state.error &&
        <Suspense
          fallback={
            this.state.oldResults !== null &&
            <Section>
              <SearchResults requestID={this.state.oldResults().requestID} results={this.state.oldResults}
                onTagClick={this.handleTagClick} onEntryEditClick={this.handleEntryEditClick}
                onEntryEditMouseOver={this.handleEntryEditMouseOver}/>
            </Section>
          }>

          <Section>
            <SearchResults requestID={this.requestID} results={this.state.results}
              onTagClick={this.handleTagClick} onEntryEditClick={this.handleEntryEditClick}
              onEntryEditMouseOver={this.handleEntryEditMouseOver}/>
          </Section>
        </Suspense>
      }

      <Section className="mt-28 border-t pt-3 flex justify-center">
        <DarkModeSwitch/>
      </Section>

      {
        this.state.bookmarkDialogOpen &&
        <BookmarkDialog ref={this.bookmarkDialogRef} dialogTitle={this.state.bookmarkDialogID !== null ? 'Edit Bookmark' : 'Add Bookmark'}
          mode={this.state.bookmarkDialogID !== null ? 'edit' : 'add'}
          url={this.state.bookmarkDialogURL} title={this.state.bookmarkDialogTitle} description={this.state.bookmarkDialogDescription}
          tags={this.state.bookmarkDialogTags}
          onURLChange={this.handleBookmarkDialogURLChange} onTitleChange={this.handleBookmarkDialogTitleChange}
          onDescriptionChange={this.handleBookmarkDialogDescriptionChange} onTagsChange={this.handleBookmarkDialogTagsChange}
          onCancel={this.hideBookmarkDialog} onSave={this.handleBookmarkDialogSave} onDelete={this.handleBookmarkDialogDelete}/>
      }
    </>
  }
}
