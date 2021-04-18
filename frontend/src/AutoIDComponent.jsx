import React from 'react'
import PropTypes from 'prop-types'

export default class AutoIDComponent extends React.Component {
  constructor(props) {
    super(props)

    if (!this.props.id) {
      this.state = { id: 'input-' + new Date().getTime() + '-' + Math.floor(Math.random() * 999999) }
    }
  }

  getID() {
    if (!this.props.id) {
      return this.state.id
    }
    return this.props.id
  }
}

AutoIDComponent.propTypes = {
  id: PropTypes.string
}
