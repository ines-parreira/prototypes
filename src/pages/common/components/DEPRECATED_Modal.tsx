import _noop from 'lodash/noop'
import React, {ReactNode, useCallback} from 'react'
import {
    Modal as BootstrapModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalProps,
} from 'reactstrap'

import {useAppNode} from 'appNode'

type Props = {
    children: ReactNode
    dismissible?: boolean
    onClose: () => void
    header?: string | ReactNode
    footer?: ReactNode
    headerClassName?: string
    footerClassName?: string
    bodyClassName?: string
} & RemoveIndex<ModalProps>

/**
 * @deprecated
 * @date 2024-05-16
 * @type ui-component
 */
export default function DEPRECATED_Modal({
    dismissible = true,
    isOpen,
    children,
    header,
    footer,
    headerClassName,
    bodyClassName,
    footerClassName,
    container,
    onClose,
    ...rest
}: Props) {
    const appNode = useAppNode()

    const toggle = useCallback(() => {
        if (!dismissible) {
            return
        }

        return onClose()
    }, [dismissible, onClose])

    const toggleProps = {
        toggle: _noop,
    }

    if (dismissible) {
        toggleProps.toggle = toggle
    }

    return (
        <BootstrapModal
            isOpen={isOpen}
            container={container ?? appNode ?? undefined}
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
                <ModalFooter className={footerClassName}>{footer}</ModalFooter>
            )}
        </BootstrapModal>
    )
}
