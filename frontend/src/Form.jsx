import React from 'react'
import PropTypes from 'prop-types'

const Form = ({className, children}) => (
  <form className={className} onSubmit={e => {e.preventDefault(); return false }}>
    {children}
  </form>
)

Form.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any
}

export default Form
