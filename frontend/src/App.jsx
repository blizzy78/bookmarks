import React, {useEffect, useRef, useState} from 'react'
import Section from './Section'
import SearchForm from './SearchForm'
import DarkModeSwitch from './DarkModeSwitch'
import * as FetchUtil from './FetchUtil'
import loadable from '@loadable/component'

const SearchResults = loadable(() => import('./SearchResults'))
const BookmarkDialog = loadable(() => import('./BookmarkDialog'))

const App = () => {
  const queryRef = useRef(null)
  const bookmarkDialogRef = useRef(null)

  const requestID = useRef(0)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [error, setError] = useState(false)
  const [bookmarkDialogBookmark, setBookmarkDialogBookmark] = useState(null)

  const handleQueryChange = async query => {
    SearchResults.preload()
    setQuery(query)

    if (query === '') {
      setResults(null)
      setError(false)
      return
    }

    const reqID = requestID.current + 1
    requestID.current = reqID
    const results = await FetchUtil.getJSON('/rest/bookmarks?q=' + encodeURIComponent(query) + '&requestID=' + reqID)
    if (results.requestID >= reqID) {
      requestID.current = results.requestID
      setResults(results)
      setError(results.error)
    }
  }

  const handleTagClick = tag => {
    handleQueryChange(query + ' tags:"' + tag + '"')
  }

  const handleEntryEditClick = async id => {
    const b = await FetchUtil.getJSON('/rest/bookmarks/' + id)
    setBookmarkDialogBookmark({
      id: id,
      url: b.url,
      title: b.title,
      description: b.description,
      tags: b.tags.map(t => ({name: t}))
    })
  }

  const handleEntryEditMouseOver = () => {
    BookmarkDialog.preload()
  }

  const handleNewBookmark = () => {
    setBookmarkDialogBookmark({
      id: null,
      url: '',
      title: '',
      description: '',
      tags: []
    })
  }

  const handleNewBookmarkMouseOver = () => {
    BookmarkDialog.preload()
  }

  const hideBookmarkDialog = () => {
    setBookmarkDialogBookmark(null)
  }

  const handleBookmarkDialogBookmarkChange = b => {
    setBookmarkDialogBookmark(b)
  }

  const handleBookmarkDialogSave = async () => {
    const req = {
      url: bookmarkDialogBookmark.url,
      title: bookmarkDialogBookmark.title,
      description: bookmarkDialogBookmark.description,
      tags: bookmarkDialogBookmark.tags.map(t => t.name)
    }

    const id = bookmarkDialogBookmark.id
    if (id !== null) {
      FetchUtil.putJSON('/rest/bookmarks/' + id, req).then(() => {
        handleQueryChange(query)
      })
      hideBookmarkDialog()
    } else {
      FetchUtil.postJSON('/rest/bookmarks', req)
      resetBookmarkDialog()
    }
  }

  const handleBookmarkDialogDelete = async () => {
    if (!window.confirm('Delete bookmark?')) {
      return
    }

    FetchUtil.deleteJSON('/rest/bookmarks/' + bookmarkDialogBookmark.id).then(() => {
      handleQueryChange(query)
    })
    hideBookmarkDialog()
  }

  const resetBookmarkDialog = () => {
    setBookmarkDialogBookmark({
      id: null,
      url: '',
      title: '',
      description: '',
      tags: []
    })
    bookmarkDialogRef.current.resetFocus()
  }

  useEffect(() => {
    queryRef.current.focus()
  }, [])

  return <>
    <Section className="mb-5">
      <SearchForm query={query} queryRef={queryRef} onQueryChange={handleQueryChange}
        onNewBookmark={handleNewBookmark} onNewBookmarkMouseOver={handleNewBookmarkMouseOver}
        error={error}/>
    </Section>

    {
      results !== null && !error &&
      <Section>
        <SearchResults results={results}
          onTagClick={handleTagClick} onEntryEditClick={handleEntryEditClick} onEntryEditMouseOver={handleEntryEditMouseOver}/>
      </Section>
    }

    <Section className="mt-28 border-t pt-3 flex justify-center">
      <DarkModeSwitch/>
    </Section>

    {
      bookmarkDialogBookmark !== null &&
      <BookmarkDialog ref={bookmarkDialogRef} bookmark={bookmarkDialogBookmark} onBookmarkChange={handleBookmarkDialogBookmarkChange}
        onCancel={hideBookmarkDialog} onSave={handleBookmarkDialogSave} onDelete={handleBookmarkDialogDelete}/>
    }
  </>
}

export default App
