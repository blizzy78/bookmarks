import React from 'react'
import ReactTags from 'react-tag-autocomplete'
import PropTypes from 'prop-types'
import './TagsInput.css'

export default class TagsInput extends React.Component {
  constructor(props) {
    super(props)

    this.handleAddition = this.handleAddition.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }

  handleAddition(tag) {
    let tags = [...this.props.tags, tag]
    this.props.onChange(tags)
  }

  handleDelete(i) {
    let tags = this.props.tags.slice(0)
    tags.splice(i, 1)
    this.props.onChange(tags)
  }

  render() {
    return (
      <ReactTags tags={this.props.tags} allowNew={true} addOnBlur={true} placeholderText=""
        delimiters={['Enter', 'Tab', ' ', ',', '.']}
        onAddition={this.handleAddition} onDelete={this.handleDelete} />
    )
  }
}

TagsInput.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired
}
