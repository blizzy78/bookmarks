import React from 'react'
import PropTypes from 'prop-types'
import './Switch.css'

const Switch = ({value, onChange}) => (
  <input type="checkbox" className="form-check-input form-check-switch" checked={value} onChange={onChange}/>
)

Switch.propTypes = {
  value: PropTypes.bool,
  onChange: PropTypes.func
}

export default Switch
