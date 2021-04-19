import React from 'react'
import TextInput from './TextInput'
import Button from './Button'
import PropTypes from 'prop-types'

export default class SearchForm extends React.Component {
  constructor(props) {
    super(props)

    this.handleQueryChange = this.handleQueryChange.bind(this)
  }

  handleQueryChange(e) {
    this.props.onQueryChange(e.target.value)
  }

  render() {
    return (
      <form id="search-form" className="flex" onSubmit={() => false}>
        <TextInput forwardedRef={this.props.queryRef} value={this.props.query} className="flex-auto mr-3" placeholder="Enter search terms"
          onChange={this.handleQueryChange} invalid={this.props.error}/>

        <Button className="flex-none" icon="fa-plus" onClick={this.props.onNewBookmark} onMouseOver={this.props.onNewBookmarkMouseOver}
          outline={true}>

          New
        </Button>
      </form>
    )
  }
}

SearchForm.propTypes = {
  query: PropTypes.string.isRequired,
  queryRef: PropTypes.object,
  error: PropTypes.bool,
  onQueryChange: PropTypes.func.isRequired,
  onNewBookmark: PropTypes.func,
  onNewBookmarkMouseOver: PropTypes.func,
}
