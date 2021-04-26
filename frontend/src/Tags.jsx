import React from 'react'
import Tag from './Tag'
import PropTypes from 'prop-types'

const Tags = ({tags, onTagClick}) => (
  tags.map(t =>
    <Tag key={t} tag={t} className="mr-1" onClick={() => onTagClick(t)}/>
  )
)

Tags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onTagClick: PropTypes.func
}

export default Tags
