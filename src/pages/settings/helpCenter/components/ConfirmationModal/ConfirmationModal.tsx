import React from 'react'
import classNames from 'classnames'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import Modal from '../../../../common/components/Modal'

import css from './ConfirmationModal.less'

export type ConfirmationModalProps = {
    children: React.ReactNode
    className?: string
    cancelText?: React.ReactNode
    confirmIntent?: ButtonIntent
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
    confirmIntent = ButtonIntent.Destructive,
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
                    <Button
                        intent={ButtonIntent.Secondary}
                        type="button"
                        onClick={onClose}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        className={classNames('ml-3', css.confirmBtn)}
                        intent={confirmIntent}
                        type="button"
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
