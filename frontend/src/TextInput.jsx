import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import './TextInput.css'

export default class TextInput extends React.Component {
  render() {
    let cssClass = classNames(
      this.props.invalid && 'is-invalid',
      this.props.className)
    return (
      <input ref={this.props.forwardedRef} id={this.props.id} type="text" value={this.props.value} className={cssClass} placeholder={this.props.placeholder}
        autoFocus={this.props.autoFocus} onChange={this.props.onChange} />
    )
  }
}

TextInput.propTypes = {
  id: PropTypes.string,
  forwardedRef: PropTypes.object,
  className: PropTypes.string,
  invalid: PropTypes.bool,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  onChange: PropTypes.func
}
