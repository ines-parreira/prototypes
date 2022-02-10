import React from 'react'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import Modal from '../../../../../common/components/Modal'

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
        <Modal
            className={css.centered}
            isOpen={true}
            header={<span>{title}</span>}
            role="dialog"
            footerClassName={css.actions}
            footer={
                <>
                    <Button
                        intent={ButtonIntent.Secondary}
                        type="button"
                        onClick={onContinueEditing}
                    >
                        Back to Editing
                    </Button>
                    <Button
                        className="ml-3"
                        intent={ButtonIntent.Secondary}
                        type="button"
                        onClick={onDiscard}
                    >
                        Discard changes
                    </Button>
                </>
            }
            onClose={onContinueEditing}
        >
            <span>{children}</span>
        </Modal>
    )
}
