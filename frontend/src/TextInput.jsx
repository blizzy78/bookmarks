import React from 'react'
import classNames from 'classnames'
import AutoIDComponent from './AutoIDComponent'
import './TextInput.css'

export default class TextInput extends AutoIDComponent {
  constructor(props) {
    super(props)

    this.inputRef = React.createRef()
  }

  focus() {
    this.inputRef.current.focus()
  }

  render() {
    let cssClass = classNames('rounded border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring focus:ring-blue-300',
      this.props.invalid && 'is-invalid',
      this.props.className)
    return (
      <input ref={this.inputRef} id={this.getID()} type="text" value={this.props.value} className={cssClass} placeholder={this.props.placeholder}
        autoFocus={this.props.autoFocus} onChange={this.props.onChange} />
    )
  }
}
