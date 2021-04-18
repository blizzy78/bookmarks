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
    return this.props.results.map(r => (
      <Entry key={r.id} result={r} onTagClick={this.props.onTagClick} onEditClick={() => this.handleEntryEditClick(r.id)}/>
    ))
  }
}

SearchResults.propTypes = {
  results: PropTypes.arrayOf(PropTypes.object).isRequired,
  onTagClick: PropTypes.func,
  onEntryEditClick: PropTypes.func
}
