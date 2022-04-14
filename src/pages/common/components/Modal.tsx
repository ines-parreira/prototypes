import React, {ReactNode, Component} from 'react'
import {
    Modal as BootstrapModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalProps,
} from 'reactstrap'
import _noop from 'lodash/noop'

type Props = {
    children: ReactNode
    dismissible: boolean
    onClose: () => void
    header?: string | ReactNode
    footer?: ReactNode
    headerClassName?: string
    footerClassName?: string
    bodyClassName?: string
} & RemoveIndex<ModalProps>

export default class Modal extends Component<Props> {
    static defaultProps: Pick<Props, 'dismissible'> = {
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
            children,
            header,
            footer,
            dismissible,
            headerClassName,
            bodyClassName,
            footerClassName,
            ...rest
        } = this.props

        const toggleProps = {
            toggle: _noop,
        }

        if (dismissible) {
            toggleProps.toggle = this._toggle
        }

        return (
            <BootstrapModal
                isOpen={isOpen}
                {...toggleProps}
                {...rest}
                fade={false}
            >
                {header && (
                    <ModalHeader {...toggleProps} className={headerClassName}>
                        {header}
                    </ModalHeader>
                )}
                <ModalBody className={bodyClassName}>{children}</ModalBody>
                {footer && (
                    <ModalFooter className={footerClassName}>
                        {footer}
                    </ModalFooter>
                )}
            </BootstrapModal>
        )
    }
}
