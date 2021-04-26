/* eslint-disable react/prop-types */
import React, {forwardRef} from 'react'
import classNames from 'classnames'
import withAutoID from './WithAutoID'
import './TextInput.css'

const TextInput = ({id, className, value, onChange, placeholder, invalid}, ref) => (
  <input ref={ref} id={id} type="text" value={value} className={classNames(invalid && 'is-invalid', className)}
    placeholder={placeholder} onChange={onChange}/>
)

export default withAutoID(forwardRef(TextInput))
