import React, {PropTypes} from 'react'
import ReactModal from 'react-modal'

const Modal = ({children, isOpen, onRequestClose}) => {
    return (
        <ReactModal
            isOpen={isOpen}
            shouldCloseOnOverlayClick
            onRequestClose={onRequestClose}
            className="ui modal active custom-modal"
            overlayClassName="ui dimmer active custom-modal-overlay"
        >
            {children}
        </ReactModal>
    )
}

Modal.propTypes = {
    isOpen: PropTypes.bool,
    onRequestClose: PropTypes.func.isRequired,
    children: PropTypes.node,
}

export default Modal
