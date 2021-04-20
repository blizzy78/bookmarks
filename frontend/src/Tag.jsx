import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class Tag extends React.Component {
  render() {
    let cssClass = classNames(
      'px-2 py-1 rounded ' +
      'bg-green-500 text-white ' +
      'font-normal outline-none focus:outline-none hover:bg-green-600 ' +
      'dark:bg-green-700 dark:text-green-100 dark:hover:bg-green-600 dark:hover:text-green-50',
      this.props.className)
    return <button className={cssClass} type="button" onClick={this.props.onClick}>{this.props.tag}</button>
  }
}

Tag.propTypes = {
  tag: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func
}
