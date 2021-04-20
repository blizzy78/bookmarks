import React from 'react'
import PropTypes from 'prop-types'
import './Switch.css'

export default class Switch extends React.Component {
  render() {
    return <input type="checkbox" className="form-check-input form-check-switch" checked={this.props.value} onChange={this.props.onChange}/>
  }
}

Switch.propTypes = {
  value: PropTypes.bool,
  onChange: PropTypes.func
}
