import classNames from 'classnames'
import type {
    ModalBodyProps,
    ModalFooterProps,
    ModalHeaderProps,
    ModalProps,
} from 'reactstrap'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

import css from './ModalWrapper.less'

export const ModalWrapper = ({
    children,
    ...props
}: ModalProps & { children: React.ReactNode }) => {
    return (
        <Modal
            contentClassName={classNames(css.modal, props.contentClassName)}
            {...props}
        >
            {children}
        </Modal>
    )
}

export const ModalHeaderWrapper = ({
    children,
    withoutBorder = false,
    ...props
}: ModalHeaderProps & {
    children: React.ReactNode
    withoutBorder?: boolean
}) => {
    return (
        <ModalHeader
            className={classNames(css.modalHeader, props.className, {
                [css.withoutBorder]: withoutBorder,
            })}
            {...props}
        >
            {children}
        </ModalHeader>
    )
}

export const ModalBodyWrapper = ({
    children,
    ...props
}: ModalBodyProps & { children: React.ReactNode }) => {
    return (
        <ModalBody
            className={classNames(css.modalBody, props.className)}
            {...props}
        >
            {children}
        </ModalBody>
    )
}

export const ModalFooterWrapper = ({
    children,
    ...props
}: ModalFooterProps & { children: React.ReactNode }) => {
    return (
        <ModalFooter
            className={classNames(css.modalFooter, props.className)}
            {...props}
        >
            {children}
        </ModalFooter>
    )
}
