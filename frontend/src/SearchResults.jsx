import React from 'react'
import Entry from './Entry'
import PropTypes from 'prop-types'

const SearchResults = ({results, onTagClick, onEntryEditClick, onEntryEditMouseOver}) => (
  results.hits.map(r =>
    <Entry key={r.id} result={r} onTagClick={onTagClick}
      onEditClick={() => onEntryEditClick(r.id)} onEditMouseOver={onEntryEditMouseOver}/>
  )
)

SearchResults.propTypes = {
  results: PropTypes.object.isRequired,
  onTagClick: PropTypes.func,
  onEntryEditClick: PropTypes.func,
  onEntryEditMouseOver: PropTypes.func
}

export default SearchResults
