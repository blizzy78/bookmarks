import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class Icon extends React.Component {
  render() {
    let cssClass = classNames('fas', this.props.name, this.props.className)
    return <i className={cssClass}></i>
  }
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string
}
