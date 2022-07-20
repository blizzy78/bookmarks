import React from 'react'
import PropTypes from 'prop-types'

const Tag = ({tag}) => (
  <div className="px-2 py-1 rounded bg-green-500 dark:bg-green-700 text-white dark:text-green-100 text-xs" type="button">
    {tag}
  </div>
)

Tag.propTypes = {
  tag: PropTypes.string.isRequired,
  className: PropTypes.string,
}

export default Tag
