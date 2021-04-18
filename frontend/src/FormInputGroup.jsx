import React from 'react'
import PropTypes from 'prop-types'

export default class FormInputGroup extends React.Component {
  componentDidMount() {
    if (!this.props.labelForRef) {
      return
    }

    // must render again so that this.props.labelForRef is populated
    this.setState({})
  }

  render() {
    return (
      <div className={this.props.className}>
        <label htmlFor={this.props.labelForRef && this.props.labelForRef.current && this.props.labelForRef.current.id}
          className="inline-block mb-1">

          {this.props.label}
        </label>

        {this.props.children}
      </div>
    )
  }
}

FormInputGroup.propTypes = {
  className: PropTypes.string,
  labelForRef: PropTypes.object,
  label: PropTypes.string.isRequired,
  children: PropTypes.any
}
