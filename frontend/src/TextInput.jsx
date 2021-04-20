import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import './TextInput.css'

const TextInput = ({forwardedRef, id, className, value, onChange, placeholder, invalid, autoFocus}) => (
  <input ref={forwardedRef} id={id} type="text" value={value} className={classNames(invalid && 'is-invalid', className)}
    placeholder={placeholder} autoFocus={autoFocus} onChange={onChange} />
)

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

export default TextInput
