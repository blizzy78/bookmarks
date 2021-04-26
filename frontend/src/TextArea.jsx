/* eslint-disable react/prop-types */
import React, {forwardRef} from 'react'
import classNames from 'classnames'

const TextArea = ({id, className, value, onChange, rows}, ref) => {
  const cssClass = classNames('rounded border focus:outline-none focus:border-blue-400 focus:ring focus:ring-blue-300',
    className)
  return (
    <textarea ref={ref} id={id} rows={rows || 6} className={cssClass}
      value={value} onChange={onChange}></textarea>
  )
}

export default forwardRef(TextArea)
