import React from 'react'
import Tag from './Tag'
import PropTypes from 'prop-types'

const Tags = ({tags}) => (
  <div className="flex flex-row gap-1">
    {
      tags.map(t =>
        <Tag key={t} tag={t}/>
      )
    }
  </div>
)

Tags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default Tags
