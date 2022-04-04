import React from 'react'
import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'

import Modal from 'pages/common/components/Modal'

import css from './CloseModal.less'

export type ConfirmationModalProps = {
    children: React.ReactNode
    isOpen: boolean
    style?: React.CSSProperties
    title: React.ReactNode
    saveText: string
    discardText: string
    editText: string
    onDiscard: () => void
    onContinueEditing: () => void
    onSave?: () => void
}

export const CloseModal = ({
    children,
    isOpen,
    style,
    title,
    saveText,
    discardText,
    editText,
    onDiscard,
    onContinueEditing,
    onSave,
}: ConfirmationModalProps): JSX.Element => {
    return (
        <Modal
            className={css.centered}
            isOpen={isOpen}
            header={title}
            role="dialog"
            footerClassName={css.actions}
            footer={
                <div className={css.footerWrapper}>
                    <Button intent="destructive" onClick={onDiscard}>
                        {discardText}
                    </Button>
                    <div>
                        <Button intent="secondary" onClick={onContinueEditing}>
                            {editText}
                        </Button>
                        {onSave && (
                            <Button
                                className={classNames('ml-3', css.confirmBtn)}
                                onClick={onSave}
                            >
                                {saveText}
                            </Button>
                        )}
                    </div>
                </div>
            }
            style={style}
            onClose={onContinueEditing}
        >
            {children}
        </Modal>
    )
}
