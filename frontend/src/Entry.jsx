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
          <a className="text-blue-600" href={this.props.result.url} dangerouslySetInnerHTML={{ __html: this.props.result.titleHTML }}></a>
          <button className="edit-button outline-none focus:outline-none ml-2" type="button" title="Edit"
            onClick={this.props.onEditClick}>
            <Icon name="fa-edit"/>
          </button>
        </h3>
        <a className="block text-sm text-green-600 font-normal" href={this.props.result.url} dangerouslySetInnerHTML={{ __html: this.props.result.urlHTML }}></a>
        <p className="my-0" dangerouslySetInnerHTML={{ __html: this.props.result.descriptionHTML }}></p>
        <div className="text-xs">
          <Tags tags={this.props.result.tags} onTagClick={this.props.onTagClick}/>
        </div>
      </div>
    )
  }
}

Entry.propTypes = {
  result: PropTypes.object.isRequired,
  onTagClick: PropTypes.func,
  onEditClick: PropTypes.func
}
