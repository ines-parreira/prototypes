import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {removeNotification as hide} from 'reapop'
import {Button} from 'reactstrap'

import {NotificationButton} from '../../../state/notifications/types'

import Modal from '../components/Modal'

type OwnProps = {
    id: number
    title?: string
    message: string
    buttons: NotificationButton[]
    dismissible: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

class ModalNotification extends Component<Props> {
    static defaultProps: Pick<Props, 'dismissible' | 'buttons'> = {
        dismissible: true,
        buttons: [],
    }

    _handleClick = (onClick: () => void) => {
        if (typeof onClick === 'function') {
            onClick()
        }

        this._toggle()
    }

    _toggle = () => {
        ;(this.props.hide as (id: number) => void)(this.props.id)
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

const connector = connect(null, {
    hide,
})

export default connector(ModalNotification)
