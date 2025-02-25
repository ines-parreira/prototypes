import React from 'react'

import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'
import DEPRECATED_Modal from 'pages/common/components/DEPRECATED_Modal'

import css from './CloseModal.less'

export type ConfirmationModalProps = {
    children: React.ReactNode
    isOpen: boolean
    isSaving?: boolean
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
    title,
    saveText,
    discardText,
    editText,
    onDiscard,
    onContinueEditing,
    onSave,
    isSaving = false,
}: ConfirmationModalProps): JSX.Element => {
    return (
        <DEPRECATED_Modal
            className={css.centered}
            isOpen={isOpen}
            header={title}
            role="dialog"
            headerClassName={css.header}
            footerClassName={css.actions}
            bodyClassName={css.body}
            footer={
                <div className={css.footerWrapper}>
                    <Button
                        className={css.discardBtn}
                        fillStyle="ghost"
                        onClick={onDiscard}
                    >
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
                                isLoading={isSaving}
                            >
                                {saveText}
                            </Button>
                        )}
                    </div>
                </div>
            }
            style={{ width: '100%', maxWidth: 600 }}
            onClose={onContinueEditing}
        >
            {children}
        </DEPRECATED_Modal>
    )
}
