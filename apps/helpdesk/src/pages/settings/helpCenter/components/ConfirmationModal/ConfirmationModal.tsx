import classNames from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'
import type {
    LegacyButtonComponentProps as ButtonComponentProps,
    LegacyButtonProps as ButtonProps,
} from '@gorgias/axiom'

import DEPRECATED_Modal from 'pages/common/components/DEPRECATED_Modal'
import css from 'pages/settings/helpCenter/components/ConfirmationModal/ConfirmationModal.less'

export type ConfirmationModalProps = {
    children: React.ReactNode
    className?: string
    cancelText?: React.ReactNode
    confirmIntent?: ButtonProps['intent']
    confirmIsLoading?: boolean
    confirmText: React.ReactNode
    isOpen: boolean
    style?: React.CSSProperties
    title: React.ReactNode
    onClose: () => void
    onConfirm: () => void
    additionalActionButtonConfig?: Omit<ButtonComponentProps, 'children'>
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
    additionalActionButtonConfig,
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
                    {additionalActionButtonConfig && (
                        <Button {...additionalActionButtonConfig}>
                            {additionalActionButtonConfig.content}
                        </Button>
                    )}
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
