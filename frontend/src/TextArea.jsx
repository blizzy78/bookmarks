import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const TextArea = ({forwardedRef, id, className, value, onChange, rows}) => {
  const cssClass = classNames('rounded border focus:outline-none focus:border-blue-400 focus:ring focus:ring-blue-300',
    className)
  return <textarea ref={forwardedRef} id={id} rows={rows || 6} className={cssClass}
    value={value} onChange={onChange}></textarea>

}

TextArea.propTypes = {
  id: PropTypes.string,
  forwardedRef: PropTypes.object,
  className: PropTypes.string,
  rows: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func
}

export default TextArea
