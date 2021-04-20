import React from 'react'
import Icon from './Icon'
import classNames from 'classnames'
import PropTypes from 'prop-types'

export default class Button extends React.Component {
  render() {
    const primaryOutline =
      'border-blue-500 text-blue-500 ' +
      'hover:border-blue-600 hover:bg-blue-600 hover:text-white ' +
      'dark:border-blue-600 dark:text-blue-400 ' +
      'dark:hover:border-blue-500 dark:hover:bg-blue-900 dark:hover:text-blue-200'
    const secondaryOutline =
      'border-gray-500 text-gray-500 ' +
      'hover:border-gray-600 hover:bg-gray-600 hover:text-white ' +
      'dark:border-gray-600 dark:text-gray-400 ' +
      'dark:hover:border-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-200'
    const dangerOutline =
      'border-red-500 text-red-500 ' +
      'hover:border-red-600 hover:bg-red-600 hover:text-white ' +
      'dark:border-red-700 dark:text-red-400 ' +
      'dark:hover:border-red-500 dark:hover:bg-red-900 dark:hover:text-red-200'

    const primary =
      'border-blue-500 bg-blue-500 text-white ' +
      'hover:border-blue-600 hover:bg-blue-600 ' +
      'dark:border-blue-500 dark:bg-blue-900 dark:text-blue-200 ' +
      'dark:hover:border-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-100'
    const secondary =
      'border-gray-500 bg-gray-500 text-white ' +
      'hover:border-gray-600 hover:bg-gray-600 ' +
      'dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 ' +
      'dark:hover:border-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200'
    const danger =
      'border-red-500 bg-red-500 text-white ' +
      'hover:border-red-600 hover:bg-red-600 ' +
      'dark:border-red-500 dark:bg-red-900 dark:text-red-200 ' +
      'dark:hover:border-red-400 dark:hover:bg-red-800 dark:hover:text-red-100'

    const primaryRing = 'focus:ring focus:ring-blue-300 dark:focus:ring-blue-700'
    const secondaryRing = 'focus:ring focus:ring-gray-300 dark:focus:ring-gray-600'
    const dangerRing = 'focus:ring focus:ring-red-300 dark:focus:ring-red-800'

    let style = this.props.buttonStyle || 'primary'
    let outline = this.props.outline

    let classes = {
      'rounded px-3 py-1.5 border focus:outline-none': true
    }

    classes[primaryOutline] = style === 'primary' && outline
    classes[secondaryOutline] = style === 'secondary' && outline
    classes[dangerOutline] = style === 'danger' && outline

    classes[primary] = style === 'primary' && !outline
    classes[secondary] = style === 'secondary' && !outline
    classes[danger] = style === 'danger' && !outline

    classes[primaryRing] = style === 'primary'
    classes[secondaryRing] = style === 'secondary'
    classes[dangerRing] = style === 'danger'

    let cssClass = classNames(classes, this.props.className)
    return (
      <button type="button" className={cssClass} onClick={this.props.onClick} onMouseOver={this.props.onMouseOver}>
        {this.props.icon && <Icon name={this.props.icon} className="mr-2"/>}
        {this.props.children}
      </button>
    )
  }
}

Button.propTypes = {
  className: PropTypes.string,
  buttonStyle: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  outline: PropTypes.bool,
  icon: PropTypes.string,
  children: PropTypes.any,
  onClick: PropTypes.func,
  onMouseOver: PropTypes.func
}