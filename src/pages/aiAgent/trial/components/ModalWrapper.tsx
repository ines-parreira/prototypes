import classNames from 'classnames'
import {
    Modal,
    ModalBody,
    ModalBodyProps,
    ModalFooter,
    ModalFooterProps,
    ModalHeader,
    ModalHeaderProps,
    ModalProps,
} from 'reactstrap'

import css from './ModalWrapper.less'

export const ModalWrapper = ({
    children,
    ...props
}: ModalProps & { children: React.ReactNode }) => {
    return (
        <Modal contentClassName={css.modal} {...props}>
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
        <ModalBody className={css.modalBody} {...props}>
            {children}
        </ModalBody>
    )
}

export const ModalFooterWrapper = ({
    children,
    ...props
}: ModalFooterProps & { children: React.ReactNode }) => {
    return (
        <ModalFooter className={css.modalFooter} {...props}>
            {children}
        </ModalFooter>
    )
}
