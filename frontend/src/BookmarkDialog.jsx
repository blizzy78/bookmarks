import React from 'react'
import Modal from './Modal'
import FormInputGroup from './FormInputGroup'
import TextInput from './TextInput'
import TextArea from './TextArea'
import TagsInput from './TagsInput'
import Button from './Button'
import PropTypes from 'prop-types'

export default class BookmarkDialog extends React.Component {
  constructor(props) {
    super(props)

    this.modalRef = React.createRef()
    this.urlRef = React.createRef()
    this.titleRef = React.createRef()
    this.descriptionRef = React.createRef()
  }

  componentDidMount() {
    this.modalRef.current.show()
    this.urlRef.current.focus()
  }

  hide() {
    this.modalRef.current.hide()
  }

  render() {
    return (
      <Modal ref={this.modalRef} title={this.props.dialogTitle} buttons={this.buttons()} onCancel={this.props.onCancel}>
        <form onSubmit={() => false}>
          <FormInputGroup label="URL" labelForRef={this.urlRef} className="mb-3">
            <TextInput ref={this.urlRef} className="block w-full" value={this.props.url} onChange={this.props.onURLChange}/>
          </FormInputGroup>

          <FormInputGroup label="Title" labelForRef={this.titleRef} className="mb-3">
            <TextInput ref={this.titleRef} className="block w-full" value={this.props.title} onChange={this.props.onTitleChange}/>
          </FormInputGroup>

          <FormInputGroup label="Description" labelForRef={this.descriptionRef} className="mb-3">
            <TextArea ref={this.descriptionRef} className="block w-full" value={this.props.description} onChange={this.props.onDescriptionChange}/>
          </FormInputGroup>

          <FormInputGroup label="Tags">
            <TagsInput tags={this.props.tags} className="block w-full" onChange={this.props.onTagsChange}/>
          </FormInputGroup>
        </form>
      </Modal>
    )
  }

  buttons() {
    return (
      <>
        <Button className="flex-none m-1" onClick={this.props.onSave}>Save</Button>
        {this.props.mode === 'edit' && <Button buttonStyle="danger" outline={true} className="flex-none m-1" onClick={this.props.onDelete}>Delete</Button>}
        <Button buttonStyle="secondary" outline={true} className="flex-none m-1" onClick={this.props.onCancel}>Cancel</Button>
      </>
    )
  }

  resetFocus() {
    this.urlRef.current.focus()
  }
}

BookmarkDialog.propTypes = {
  dialogTitle: PropTypes.string.isRequired,
  mode: PropTypes.oneOf(['add', 'edit']),
  url: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.object),
  onURLChange: PropTypes.func,
  onTitleChange: PropTypes.func,
  onDescriptionChange: PropTypes.func,
  onTagsChange: PropTypes.func,
  onCancel: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func
}
