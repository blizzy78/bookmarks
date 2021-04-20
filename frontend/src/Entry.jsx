import React from 'react'
import Icon from './Icon'
import Tags from './Tags'
import PropTypes from 'prop-types'
import './Entry.css'

export default class Entry extends React.Component {
  render() {
    return (
      <div className="entry mb-4">
        <h3 className="my-0">
          <a className="text-blue-600 dark:text-blue-400" href={this.props.result.url} dangerouslySetInnerHTML={{__html: this.props.result.titleHTML}}></a>
          <button className="edit-button outline-none focus:outline-none ml-2" type="button" title="Edit"
            onClick={this.props.onEditClick} onMouseOver={this.props.onEditMouseOver}>
            <Icon name="fa-edit"/>
          </button>
        </h3>
        <a className="block text-sm text-green-600 dark:text-green-400 font-normal" href={this.props.result.url} dangerouslySetInnerHTML={{__html: this.props.result.urlHTML}}></a>
        {
          this.props.result.descriptionHTML.length > 0 &&
          <p className="my-0" dangerouslySetInnerHTML={{__html: this.props.result.descriptionHTML}}></p>
        }
        {
          this.props.result.tags.length > 0 &&
          <div className="text-xs mt-1">
            <Tags tags={this.props.result.tags} onTagClick={this.props.onTagClick}/>
          </div>
        }
      </div>
    )
  }
}

Entry.propTypes = {
  result: PropTypes.object.isRequired,
  onTagClick: PropTypes.func,
  onEditClick: PropTypes.func,
  onEditMouseOver: PropTypes.func
}
