import type { ReactNode } from 'react'

import {
    Button,
    Modal,
    OverlayContent,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import css from './UnsavedChangesModal.less'

export type UnsavedChangesModalProps = {
    onDiscard: () => void
    isOpen: boolean
    onClose: () => void
    onSave: () => Promise<void> | void
    body?: ReactNode
    title?: string
    primaryCtaText?: string
    shouldShowDiscardButton?: boolean
    shouldShowSaveButton?: boolean
}

const UnsavedChangesModal = ({
    onDiscard,
    onSave,
    isOpen,
    onClose,
    shouldShowDiscardButton = true,
    shouldShowSaveButton = true,
    body = `Your changes to this page will be lost if you don't save them.`,
    title = 'Save changes?',
    primaryCtaText = 'Save Changes',
}: UnsavedChangesModalProps) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
            <OverlayHeader title={title} />
            <OverlayContent>
                <div className={css.body}>
                    {typeof body === 'string' ? <Text>{body}</Text> : body}
                </div>
            </OverlayContent>
            <div className={css.footer}>
                {shouldShowDiscardButton && (
                    <Button
                        variant="tertiary"
                        intent="destructive"
                        onClick={onDiscard}
                    >
                        Discard Changes
                    </Button>
                )}
                <div className={css.rightButtons}>
                    <Button variant="secondary" onClick={onClose}>
                        Back To Editing
                    </Button>
                    {shouldShowSaveButton && (
                        <Button variant="primary" onClick={onSave}>
                            {primaryCtaText}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    )
}

export default UnsavedChangesModal
