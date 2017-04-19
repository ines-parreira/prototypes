import React, {PropTypes} from 'react'
import {
    Modal as BootstrapModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from 'reactstrap'

export default class Modal extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool,
        onClose: PropTypes.func,
        children: PropTypes.node.isRequired,
        header: PropTypes.node,
        footer: PropTypes.node,
        dismissible: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        dismissible: true,
    }

    _toggle = () => {
        if (!this.props.dismissible) {
            return
        }

        return this.props.onClose()
    }

    render() {
        const {
            isOpen,
            onClose, // eslint-disable-line
            children,
            header,
            footer,
            dismissible,
            ...rest,
        } = this.props

        const toggleProps = {}

        if (dismissible) {
            toggleProps.toggle = this._toggle
        }

        return (
            <BootstrapModal
                isOpen={isOpen}
                {...toggleProps}
                {...rest}
            >
                {
                    header && (
                        <ModalHeader
                            {...toggleProps}
                        >
                            {header}
                        </ModalHeader>
                    )
                }
                <ModalBody>
                    {children}
                </ModalBody>
                {
                    footer && (
                        <ModalFooter>
                            {footer}
                        </ModalFooter>
                    )
                }
            </BootstrapModal>
        )
    }
}
