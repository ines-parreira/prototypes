import React from 'react'
import classNames from 'classnames'

import Button from 'reactstrap/lib/Button'

import Modal from '../../../../common/components/Modal'

import css from './ConfirmationModal.less'

type ButtonColor = 'danger' | 'success'

export type ConfirmationModalProps = {
    children: React.ReactNode
    className?: string
    cancelText?: React.ReactNode
    confirmColor?: ButtonColor
    confirmText: React.ReactNode
    isOpen: boolean
    style?: React.CSSProperties
    title: React.ReactNode
    onClose: () => void
    onConfirm: () => void
}

export const ConfirmationModal = ({
    children,
    className,
    cancelText = 'Cancel',
    confirmColor = 'danger',
    confirmText,
    isOpen,
    style,
    title,
    onClose,
    onConfirm,
}: ConfirmationModalProps): JSX.Element => {
    return (
        <Modal
            className={classNames(css.centered, className)}
            isOpen={isOpen}
            header={title}
            role="dialog"
            footerClassName={css.actions}
            footer={
                <>
                    <Button onClick={onClose}>{cancelText}</Button>
                    <Button
                        color={confirmColor}
                        className={classNames('ml-3', css.confirmBtn)}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </Button>
                </>
            }
            style={style}
            onClose={onClose}
        >
            {children}
        </Modal>
    )
}
