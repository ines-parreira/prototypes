import React from 'react'
import Button from 'pages/common/components/button/Button'
import {ConfirmationButton} from './ConfirmationButton'

interface Props {
    isNewWorkflow: boolean
    isFetchPending: boolean
    isPublishPending: boolean
    isSavePending: boolean
    isDraft: boolean
    isDirty: boolean
    onCancel: () => void
    onSave: () => void
    onPublish: () => void
    onDiscard: () => void
}

export const WorkflowEditorActionButtons = ({
    isNewWorkflow,
    isFetchPending,
    isSavePending,
    isPublishPending,
    isDraft,
    isDirty,
    onCancel,
    onSave,
    onPublish,
    onDiscard,
}: Props) => {
    if (isNewWorkflow) {
        return (
            <>
                <Button
                    onClick={onCancel}
                    isDisabled={isFetchPending}
                    intent="secondary"
                >
                    Cancel
                </Button>

                <Button
                    onClick={onSave}
                    isLoading={isFetchPending || isSavePending}
                    isDisabled={!isDirty || isFetchPending}
                    intent="secondary"
                >
                    Save
                </Button>

                <Button
                    onClick={onPublish}
                    isLoading={isFetchPending || isPublishPending}
                    isDisabled={!isDirty || isFetchPending}
                >
                    Publish
                </Button>
            </>
        )
    }

    return (
        <>
            <ConfirmationButton
                confirmationButtonLabel="Discard Changes"
                confirmationTitle="Discard changes?"
                confirmationText="Your changes will be lost and this action cannot be undone"
                isDisabled={!isDirty || isSavePending || isFetchPending}
                onClick={onDiscard}
            >
                Discard Changes
            </ConfirmationButton>

            {isDraft && (
                <Button
                    onClick={onSave}
                    isLoading={isSavePending}
                    isDisabled={!isDirty || isFetchPending}
                    intent="secondary"
                >
                    Save
                </Button>
            )}
            <Button
                onClick={onPublish}
                isLoading={isPublishPending}
                isDisabled={!isDirty || isFetchPending}
            >
                Publish
            </Button>
        </>
    )
}
