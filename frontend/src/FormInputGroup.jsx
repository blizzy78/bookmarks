import React from 'react'
import PropTypes from 'prop-types'
import useForceInitialRerender from './UseForceInitialRerender'

const FormInputGroup = ({className, labelForRef, label, children}) => {
  useForceInitialRerender()

  return (
    <div className={className}>
      <label htmlFor={labelForRef && labelForRef.current && labelForRef.current.id} className="inline-block mb-1">
        {label}
      </label>

      {children}
    </div>
  )
}

FormInputGroup.propTypes = {
  className: PropTypes.string,
  labelForRef: PropTypes.object,
  label: PropTypes.string.isRequired,
  children: PropTypes.any
}

export default FormInputGroup
