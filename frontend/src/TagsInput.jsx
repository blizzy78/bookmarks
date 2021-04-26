import React from 'react'
import ReactTags from 'react-tag-autocomplete'
import PropTypes from 'prop-types'
import './TagsInput.css'

const TagsInput = ({tags, onChange}) => {
  const handleAddition = t => {
    onChange([...tags, t])
  }

  const handleDelete = i => {
    const ts = tags.slice(0)
    ts.splice(i, 1)
    onChange(ts)
  }

  return (
    <ReactTags tags={tags} allowNew={true} addOnBlur={true} placeholderText=""
      delimiters={['Enter', 'Tab', ' ', ',', '.']}
      onAddition={handleAddition} onDelete={handleDelete}/>
  )
}

TagsInput.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired
}

export default TagsInput
