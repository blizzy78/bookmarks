import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class TextArea extends React.Component {
  render() {
    let cssClass = classNames('rounded border focus:outline-none focus:border-blue-400 focus:ring focus:ring-blue-300',
      this.props.className)
    return <textarea ref={this.props.forwardedRef} id={this.props.id} rows={this.props.rows || 6} className={cssClass}
      value={this.props.value} onChange={this.props.onChange}></textarea>
  }
}

TextArea.propTypes = {
  id: PropTypes.string,
  forwardedRef: PropTypes.object,
  className: PropTypes.string,
  rows: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func
}
