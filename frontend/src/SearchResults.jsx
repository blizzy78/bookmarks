import React from 'react'
import Entry from './Entry'
import PropTypes from 'prop-types'

const SearchResults = ({results, onEntryEditClick, onEntryEditMouseOver}) => (
  <div className="flex flex-col gap-5">
    {
      results.hits.map(r =>
        <Entry key={r.id} result={r} onEditClick={() => onEntryEditClick(r.id)} onEditMouseOver={onEntryEditMouseOver}/>
      )
    }
  </div>
)

SearchResults.propTypes = {
  results: PropTypes.object.isRequired,
  onEntryEditClick: PropTypes.func,
  onEntryEditMouseOver: PropTypes.func
}

export default SearchResults
