import type { ReactNode } from 'react'
import React, { useCallback } from 'react'
import type { ModalProps } from 'reactstrap'
import {
    Modal as BootstrapModal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from 'reactstrap'
import { noop } from '@gorgias/toolkit'

import { useAppNode } from 'appNode'

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
export function DEPRECATED_Modal({
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
        toggle: noop,
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
