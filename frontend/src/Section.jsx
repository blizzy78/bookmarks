import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class Section extends React.Component {
  render() {
    let cssClass = classNames('container mx-auto', this.props.className)
    return <section className={cssClass}>{this.props.children}</section>
  }
}

Section.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any
}
