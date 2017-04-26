import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {hide} from 'react-notification-system-redux'
import {Button} from 'reactstrap'

import Modal from '../components/Modal'

class ModalNotification extends React.Component {
    static propTypes = {
        uid: PropTypes.number.isRequired,
        title: PropTypes.string,
        message: PropTypes.string.isRequired,
        buttons: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            onClick: PropTypes.func,
            color: PropTypes.string,
        })).isRequired,
        dismissible: PropTypes.bool.isRequired,
        hide: PropTypes.func.isRequired,
    }

    static defaultProps = {
        dismissible: true,
        buttons: []
    }

    _handleClick = (onClick) => {
        if (typeof onClick === 'function') {
            onClick()
        }

        this._toggle()
    }

    _toggle = () => {
        this.props.hide(this.props.uid)
    }

    render() {
        const {title, message, buttons, dismissible} = this.props

        return (
            <Modal
                isOpen
                className="MergeUsersModal"
                size="lg"
                onClose={this._toggle}
                dismissible={dismissible}
                header={title}
                footer={
                    buttons.map((button, index) => {
                        return (
                            <Button
                                key={index}
                                type="button"
                                onClick={() => {
                                    this._handleClick(button.onClick)
                                }}
                                color={button.color}
                                className="mr-2"
                            >
                                {button.name}
                            </Button>
                        )
                    })
                }
            >
                {message}
            </Modal>
        )
    }
}

const mapDispatchToProps = {
    hide,
}

export default connect(null, mapDispatchToProps)(ModalNotification)
