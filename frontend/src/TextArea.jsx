import React from 'react'
import AutoIDComponent from './AutoIDComponent'
import classNames from 'classnames'

export default class TextArea extends AutoIDComponent {
  render() {
    let cssClass = classNames('rounded border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring focus:ring-blue-300',
      this.props.className)
    return <textarea id={this.getID()} rows={this.props.rows || 6} className={cssClass} value={this.props.value} onChange={this.props.onChange}></textarea>
  }
}
