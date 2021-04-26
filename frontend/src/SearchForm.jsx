import React from 'react'
import TextInput from './TextInput'
import Button from './Button'
import Form from './Form'
import PropTypes from 'prop-types'

const SearchForm = ({query, queryRef, error, onQueryChange, onNewBookmark, onNewBookmarkMouseOver}) => (
  <Form className="flex">
    <TextInput ref={queryRef} value={query} className="flex-auto mr-3" placeholder="Enter search terms"
      onChange={e => onQueryChange(e.target.value)} invalid={error}/>

    <Button className="flex-none" icon="fa-plus" onClick={onNewBookmark} onMouseOver={onNewBookmarkMouseOver}
      outline={true}>

      New
    </Button>
  </Form>
)

SearchForm.propTypes = {
  query: PropTypes.string.isRequired,
  queryRef: PropTypes.object,
  error: PropTypes.bool,
  onQueryChange: PropTypes.func.isRequired,
  onNewBookmark: PropTypes.func,
  onNewBookmarkMouseOver: PropTypes.func,
}

export default SearchForm
