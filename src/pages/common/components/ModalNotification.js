import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {removeNotification as hide} from 'reapop'
import {Button} from 'reactstrap'

import Modal from '../components/Modal'

class ModalNotification extends React.Component {
    static propTypes = {
        id: PropTypes.number.isRequired,
        title: PropTypes.string,
        message: PropTypes.string.isRequired,
        buttons: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                onClick: PropTypes.func,
                color: PropTypes.string,
            })
        ).isRequired,
        dismissible: PropTypes.bool.isRequired,
        hide: PropTypes.func.isRequired,
    }

    static defaultProps = {
        dismissible: true,
        buttons: [],
    }

    _handleClick = (onClick) => {
        if (typeof onClick === 'function') {
            onClick()
        }

        this._toggle()
    }

    _toggle = () => {
        this.props.hide(this.props.id)
    }

    render() {
        const {title, message, buttons, dismissible} = this.props

        return (
            <Modal
                isOpen
                size="lg"
                onClose={this._toggle}
                dismissible={dismissible}
                header={title}
                footer={buttons.map((button, index) => {
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
                })}
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
