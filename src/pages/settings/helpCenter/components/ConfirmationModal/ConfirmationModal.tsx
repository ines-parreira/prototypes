import React, {ComponentProps} from 'react'
import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'

import DEPRECATED_Modal from '../../../../common/components/DEPRECATED_Modal'

import css from './ConfirmationModal.less'

export type ConfirmationModalProps = {
    children: React.ReactNode
    className?: string
    cancelText?: React.ReactNode
    confirmIntent?: ComponentProps<typeof Button>['intent']
    confirmIsLoading?: boolean
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
    confirmIntent = 'destructive',
    confirmIsLoading,
    confirmText,
    isOpen,
    style,
    title,
    onClose,
    onConfirm,
}: ConfirmationModalProps): JSX.Element => {
    return (
        <DEPRECATED_Modal
            className={classNames(css.centered, className)}
            isOpen={isOpen}
            header={title}
            role="dialog"
            footerClassName={css.actions}
            footer={
                <>
                    <Button intent="secondary" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        className={classNames('ml-3', css.confirmBtn)}
                        intent={confirmIntent}
                        isLoading={confirmIsLoading}
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
        </DEPRECATED_Modal>
    )
}
