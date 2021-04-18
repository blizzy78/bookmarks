import React from 'react'
import Tag from './Tag'
import PropTypes from 'prop-types'

export default class Tags extends React.Component {
  constructor(props) {
    super(props)

    this.handleTagClick = this.handleTagClick.bind(this)
  }

  handleTagClick(tag) {
    this.props.onTagClick(tag)
  }

  render() {
    return this.props.tags.map(t => <Tag key={t} tag={t} className="mr-2" onClick={() => this.handleTagClick(t)} />)
  }
}

Tags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onTagClick: PropTypes.func
}
