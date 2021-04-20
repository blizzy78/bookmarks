import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const Icon = ({name, className}) => (
  <i className={classNames('fas', name, className)}></i>
)

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string
}

export default Icon
