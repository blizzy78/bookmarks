import React from 'react'
import Modal from './Modal'
import FormInputGroup from './FormInputGroup'
import TextInput from './TextInput'
import TextArea from './TextArea'
import TagsInput from './TagsInput'
import Button from './Button'
import Form from './Form'
import PropTypes from 'prop-types'
import withAutoID from './WithAutoID'

const TextInputWithAutoID = withAutoID(TextInput)
const TextAreaWithAutoID = withAutoID(TextArea)

export default class BookmarkDialog extends React.Component {
  constructor(props) {
    super(props)

    this.urlRef = React.createRef()
    this.titleRef = React.createRef()
    this.descriptionRef = React.createRef()

    this.handleURLChange = this.handleURLChange.bind(this)
    this.handleTitleChange = this.handleTitleChange.bind(this)
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this)
    this.handleTagsChange = this.handleTagsChange.bind(this)

    this.state = {
      url: props.bookmark.url,
      title: props.bookmark.title,
      description: props.bookmark.description,
      tags: props.bookmark.tags
    }
    this.id = props.bookmark.id
  }

  componentDidUpdate() {
    this.id = this.props.bookmark.id
    if (this.props.bookmark.url !== this.state.url) {
      this.setState({url: this.props.bookmark.url})
    }
    if (this.props.bookmark.title !== this.state.title) {
      this.setState({title: this.props.bookmark.title})
    }
    if (this.props.bookmark.description !== this.state.description) {
      this.setState({description: this.props.bookmark.description})
    }
    if (!this.equalTags(this.props.bookmark.tags, this.state.tags)) {
      this.setState({tags: this.props.bookmark.tags})
    }
  }

  equalTags(t1, t2) {
    if (t1.length !== t2.length) {
      return false
    }

    for (let i = 0; i < t1.length; i++) {
      if (t1[i].name !== t2[i].name) {
        return false
      }
    }

    return true
  }

  componentDidMount() {
    this.resetFocus()
  }

  handleURLChange(e) {
    let url = e.target.value
    this.setState({url: url})

    this.fireBookmarkChange({
      id: this.id,
      url: url,
      title: this.state.title,
      description: this.state.description,
      tags: this.state.tags
    })
  }

  handleTitleChange(e) {
    let title = e.target.value
    this.setState({title: title})

    this.fireBookmarkChange({
      id: this.id,
      url: this.state.url,
      title: title,
      description: this.state.description,
      tags: this.state.tags
    })
  }

  handleDescriptionChange(e) {
    let description = e.target.value
    this.setState({description: description})

    this.fireBookmarkChange({
      id: this.id,
      url: this.state.url,
      title: this.state.title,
      description: description,
      tags: this.state.tags
    })
  }

  handleTagsChange(tags) {
    this.setState({tags: tags})

    this.fireBookmarkChange({
      id: this.id,
      url: this.state.url,
      title: this.state.title,
      description: this.state.description,
      tags: tags
    })
  }

  fireBookmarkChange(bookmark) {
    this.props.onBookmarkChange(bookmark)
  }

  render() {
    return (
      <Modal title={this.id !== null ? 'Edit Bookmark' : 'Add Bookmark'} buttons={this.buttons()} onCancel={this.props.onCancel}>
        <Form>
          <FormInputGroup label="URL" labelForRef={this.urlRef} className="mb-3">
            <TextInputWithAutoID ref={this.urlRef} className="block w-full" value={this.state.url} onChange={this.handleURLChange}/>
          </FormInputGroup>

          <FormInputGroup label="Title" labelForRef={this.titleRef} className="mb-3">
            <TextInputWithAutoID ref={this.titleRef} className="block w-full" value={this.state.title} onChange={this.handleTitleChange}/>
          </FormInputGroup>

          <FormInputGroup label="Description" labelForRef={this.descriptionRef} className="mb-3">
            <TextAreaWithAutoID ref={this.descriptionRef} className="block w-full" value={this.state.description} onChange={this.handleDescriptionChange}/>
          </FormInputGroup>

          <FormInputGroup label="Tags">
            <TagsInput className="block w-full" tags={this.state.tags} onChange={this.handleTagsChange}/>
          </FormInputGroup>
        </Form>
      </Modal>
    )
  }

  buttons() {
    return <>
      <Button className="flex-none m-1" onClick={this.props.onSave}>Save</Button>
      {
        this.id !== null &&
        <Button buttonStyle="danger" outline={true} className="flex-none m-1" onClick={this.props.onDelete}>Delete</Button>
      }
      <Button buttonStyle="secondary" outline={true} className="flex-none m-1" onClick={this.props.onCancel}>Cancel</Button>
    </>
  }

  resetFocus() {
    this.urlRef.current.focus()
  }
}

BookmarkDialog.propTypes = {
  bookmark: PropTypes.object.isRequired,
  onBookmarkChange: PropTypes.func,
  onCancel: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func
}
