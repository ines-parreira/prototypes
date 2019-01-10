import React from 'react'
import PropTypes from 'prop-types'
import {
    Modal as BootstrapModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from 'reactstrap'

export default class Modal extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired,
        dismissible: PropTypes.bool.isRequired,
        isOpen: PropTypes.bool,
        onClose: PropTypes.func,
        header: PropTypes.node,
        footer: PropTypes.node,
        headerClassName: PropTypes.string,
        footerClassName: PropTypes.string,
        bodyClassName: PropTypes.string,
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
            headerClassName,
            bodyClassName,
            footerClassName,
            ...rest,
        } = this.props

        const toggleProps = {}

        if (dismissible) {
            toggleProps.toggle = this._toggle
        }

        return (
            <BootstrapModal
                isOpen={isOpen}
                fade={false}
                {...toggleProps}
                {...rest}
            >
                {
                    header && (
                        <ModalHeader
                            {...toggleProps}
                            className={headerClassName}
                        >
                            {header}
                        </ModalHeader>
                    )
                }
                <ModalBody className={bodyClassName}>
                    {children}
                </ModalBody>
                {
                    footer && (
                        <ModalFooter className={footerClassName}>
                            {footer}
                        </ModalFooter>
                    )
                }
            </BootstrapModal>
        )
    }
}
