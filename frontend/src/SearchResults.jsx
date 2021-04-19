import React from 'react'
import Entry from './Entry'
import PropTypes from 'prop-types'

export default class SearchResults extends React.Component {
  constructor(props) {
    super(props)

    this.handleEntryEditClick = this.handleEntryEditClick.bind(this)
  }

  handleEntryEditClick(id) {
    this.props.onEntryEditClick(id)
  }

  render() {
    if (this.props.results().requestID != this.props.requestID) {
      return null
    }

    return <>
      {
        this.props.results().hits.map(r => (
          <Entry key={r.id} result={r} onTagClick={this.props.onTagClick}
            onEditClick={() => this.handleEntryEditClick(r.id)} onEditMouseOver={this.props.onEntryEditMouseOver}/>
        ))
      }
    </>
  }
}

SearchResults.propTypes = {
  requestID: PropTypes.number.isRequired,
  results: PropTypes.func.isRequired,
  onTagClick: PropTypes.func,
  onEntryEditClick: PropTypes.func,
  onEntryEditMouseOver: PropTypes.func
}
