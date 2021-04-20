import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const Section = ({className, children}) => (
  <section className={classNames('container mx-auto', className)}>
    {children}
  </section>
)

Section.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any
}

export default Section
