import React from 'react'
import Button from 'pages/common/components/button/Button'
import {ConfirmationButton} from './ConfirmationButton'

interface Props {
    isNewWorkflow: boolean
    areDraftsEnabled: boolean
    isFetchPending: boolean
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
    areDraftsEnabled,
    isFetchPending,
    isSavePending,
    isDraft,
    isDirty,
    onCancel,
    onSave,
    onPublish,
    onDiscard,
}: Props) => {
    if (areDraftsEnabled && isNewWorkflow) {
        return (
            <>
                <Button
                    onClick={onCancel}
                    isLoading={isFetchPending}
                    intent="secondary"
                >
                    Cancel
                </Button>

                <Button
                    onClick={onSave}
                    isLoading={isFetchPending}
                    isDisabled={!isDirty}
                    intent="secondary"
                >
                    Save
                </Button>

                <Button
                    onClick={onPublish}
                    isLoading={isFetchPending || isSavePending}
                    isDisabled={!isDirty}
                >
                    Publish
                </Button>
            </>
        )
    }

    if (areDraftsEnabled) {
        return (
            <>
                <ConfirmationButton
                    confirmationButtonLabel="Discard Changes"
                    confirmationTitle="Discard changes?"
                    confirmationText="Your changes will be lost and this action cannot be undone"
                    isDisabled={!isDirty || isFetchPending || isSavePending}
                    onClick={onDiscard}
                >
                    Discard Changes
                </ConfirmationButton>

                {isDraft && (
                    <Button
                        onClick={onSave}
                        isLoading={isFetchPending}
                        isDisabled={!isDirty}
                        intent="secondary"
                    >
                        Save
                    </Button>
                )}
                <Button
                    onClick={onPublish}
                    isLoading={isFetchPending || isSavePending}
                >
                    Publish
                </Button>
            </>
        )
    }

    return (
        <>
            {isNewWorkflow ? (
                <Button
                    onClick={onCancel}
                    isLoading={isFetchPending}
                    intent="secondary"
                >
                    Cancel
                </Button>
            ) : (
                <ConfirmationButton
                    confirmationButtonLabel="Discard Changes"
                    confirmationTitle="Discard changes?"
                    confirmationText="Your changes will be lost and this action cannot be undone"
                    isDisabled={!isDirty || isFetchPending || isSavePending}
                    onClick={onDiscard}
                >
                    Discard Changes
                </ConfirmationButton>
            )}
            <Button
                onClick={onPublish}
                isLoading={isFetchPending || isSavePending}
                isDisabled={!isDirty}
            >
                {isNewWorkflow ? 'Create flow' : 'Save & Close'}
            </Button>
        </>
    )
}
