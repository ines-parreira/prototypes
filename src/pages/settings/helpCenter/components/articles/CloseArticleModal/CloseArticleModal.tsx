import React from 'react'
import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'

import Modal from '../../../../../common/components/Modal'

import css from './CloseArticleModal.less'

export type ConfirmationModalProps = {
    children: React.ReactNode
    isOpen: boolean
    style?: React.CSSProperties
    title: React.ReactNode
    onDiscard: () => void
    onContinueEditing: () => void
    onSave?: () => void
}

export const CloseArticleModal = ({
    children,
    isOpen,
    style,
    title,
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
                        Discard changes
                    </Button>
                    <div>
                        <Button intent="secondary" onClick={onContinueEditing}>
                            Edit article
                        </Button>
                        {onSave && (
                            <Button
                                className={classNames('ml-3', css.confirmBtn)}
                                onClick={onSave}
                            >
                                Save article
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
