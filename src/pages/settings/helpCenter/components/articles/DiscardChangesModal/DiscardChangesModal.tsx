import React from 'react'

import Button from 'pages/common/components/button/Button'

import DEPRECATED_Modal from '../../../../../common/components/DEPRECATED_Modal'

import css from './DiscardChangesModal.less'

export type ConfirmationModalProps = {
    children: React.ReactNode
    title: React.ReactNode
    onDiscard: () => void
    onContinueEditing: () => void
    onSave?: () => void
}

export const DiscardChangesModal = ({
    children,
    title,
    onDiscard,
    onContinueEditing,
}: ConfirmationModalProps): JSX.Element => {
    return (
        <DEPRECATED_Modal
            className={css.centered}
            isOpen={true}
            header={<span>{title}</span>}
            role="dialog"
            footerClassName={css.actions}
            footer={
                <>
                    <Button intent="secondary" onClick={onContinueEditing}>
                        Back to Editing
                    </Button>
                    <Button
                        className="ml-3"
                        intent="secondary"
                        onClick={onDiscard}
                    >
                        Discard changes
                    </Button>
                </>
            }
            onClose={onContinueEditing}
        >
            <span>{children}</span>
        </DEPRECATED_Modal>
    )
}
