import { useState } from 'react'
import { Button, Modal, Text, TextAreaField, TextField } from '@gorgias/axiom'

import type { Workflow } from './gaiaComposer'
import { nextWorkflowId } from './gaiaComposer'
import css from './GaiaHomePage.less'

/**
 * "Create new workflow" flow surfaced from the composer's "+" → "Run a
 * workflow" → "New workflow" path. A workflow is a reusable "/shortcut" that
 * teaches Gaia a specific task; Shortcut + Instructions are required.
 */
export function CreateWorkflowModal({
    onClose,
    onSave,
}: {
    onClose: () => void
    onSave: (workflow: Workflow) => void
}) {
    const [shortcut, setShortcut] = useState('/')
    const [description, setDescription] = useState('')
    const [instructions, setInstructions] = useState('')
    const [showErrors, setShowErrors] = useState(false)

    // A shortcut needs at least one character after the leading slash.
    const shortcutValid = shortcut.trim().replace(/^\/+/, '').length > 0
    const instructionsValid = instructions.trim().length > 0

    const handleSave = () => {
        if (!shortcutValid || !instructionsValid) {
            setShowErrors(true)
            return
        }
        const normalized = `/${shortcut.trim().replace(/^\/+/, '')}`
        onSave({
            id: nextWorkflowId(),
            shortcut: normalized,
            description: description.trim() || undefined,
            instructions: instructions.trim(),
        })
        onClose()
    }

    return (
        <Modal isOpen onOpenChange={(open) => !open && onClose()} size="sm">
            <div className={css.dialog}>
                <div className={css.dialogHeader}>
                    <div>
                        <div className={css.dialogTitle}>
                            Create new workflow
                        </div>
                        <Text className={css.dialogSubtitle}>
                            Workflows are small, reusable instructions that
                            teach Gaia how to perform specific tasks or follow
                            precise conventions consistently.
                        </Text>
                    </div>
                    <Button
                        variant="tertiary"
                        size="sm"
                        icon="close"
                        aria-label="Close"
                        onClick={onClose}
                    />
                </div>

                <div className={css.dialogBody}>
                    <div className={css.field}>
                        <span className={css.fieldLabel}>
                            Shortcut
                            <span className={css.fieldRequired}>*</span>
                        </span>
                        <TextField
                            aria-label="Shortcut"
                            value={shortcut}
                            onChange={setShortcut}
                            isInvalid={showErrors && !shortcutValid}
                        />
                        {showErrors && !shortcutValid && (
                            <span className={css.fieldError}>
                                Add a shortcut after the “/”.
                            </span>
                        )}
                    </div>

                    <div className={css.field}>
                        <span className={css.fieldLabel}>
                            Description (optional)
                        </span>
                        <TextField
                            aria-label="Description"
                            value={description}
                            onChange={setDescription}
                        />
                    </div>

                    <div className={css.field}>
                        <span className={css.fieldLabel}>
                            Instructions
                            <span className={css.fieldRequired}>*</span>
                        </span>
                        <TextAreaField
                            aria-label="Instructions"
                            rows={3}
                            placeholder="Summarize yesterday’s automation rate"
                            value={instructions}
                            onChange={setInstructions}
                            isInvalid={showErrors && !instructionsValid}
                        />
                        {showErrors && !instructionsValid && (
                            <span className={css.fieldError}>
                                Tell Gaia what this workflow should do.
                            </span>
                        )}
                    </div>
                </div>

                <div className={css.dialogFooter}>
                    <Button variant="tertiary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
