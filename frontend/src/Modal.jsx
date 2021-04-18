import React from 'react'
import BModal from 'bootstrap/js/src/modal'
import PropTypes from 'prop-types'
import './Modal.css'

export default class Modal extends React.Component {
  constructor(props) {
    super(props)

    this.hide = this.hide.bind(this)

    this.modalRef = React.createRef()
    this.modal = null
  }

  componentDidMount() {
    this.modal = new BModal(this.modalRef.current, {backdrop: 'static', keyboard: false})
    this.modalRef.current.addEventListener('hidePrevented.bs.modal', this.props.onCancel)
  }

  componentWillUnmount() {
    this.hide()
  }

  show() {
    this.modal.show()
  }

  hide() {
    this.modal.hide()
  }

  render() {
    return (
      <div ref={this.modalRef} className="modal hidden fixed top-0 left-0 z-40 w-full h-full overflow-hidden">
        <div className="modal-dialog relative w-auto max-w-full md:max-w-screen-sm xl:max-w-screen-lg mx-5 md:mx-auto my-8 pointer-events-none">
          <div className="relative flex flex-col w-full pointer-events-auto rounded border border-gray-500 bg-white">
            <div className="flex flex-shrink-0 items-center justify-between p-4 border-b">
              <h2 className="my-0">{this.props.title}</h2>
              <button type="button" className="btn-modal-close" onClick={this.props.onCancel} aria-label="Close"></button>
            </div>

            <div className="relative flex-auto p-4">{this.props.children}</div>

            <div className="flex flex-wrap flex-shrink-0 items-center justify-end p-3 border-t">{this.props.buttons}</div>
          </div>
        </div>
      </div>
    )
  }
}

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.any,
  buttons: PropTypes.any,
  onCancel: PropTypes.func
}
