import { Button, Tooltip } from '@gorgias/axiom'

import IconButton from 'pages/common/components/button/IconButton'

import { ConfirmationButton } from './ConfirmationButton'

interface Props {
    isNewWorkflow: boolean
    isFetchPending: boolean
    isPublishPending: boolean
    isSavePending: boolean
    isDraft: boolean
    isDirty: boolean
    isTestDisabled: boolean
    onCancel: () => void
    onSave: () => void
    onPublish: () => void
    onTest: () => void
    onDiscard: () => void
    onViewChannel: () => void
}

export const WorkflowEditorActionButtons = ({
    isNewWorkflow,
    isFetchPending,
    isSavePending,
    isPublishPending,
    isTestDisabled,
    isDraft,
    isDirty,
    onCancel,
    onSave,
    onTest,
    onPublish,
    onDiscard,
    onViewChannel,
}: Props) => {
    if (isNewWorkflow) {
        return (
            <>
                <Button
                    onClick={() => onTest()}
                    intent="secondary"
                    isDisabled={isTestDisabled}
                    id="test-disabled"
                    leadingIcon="play_circle"
                >
                    Test
                </Button>

                {isTestDisabled && (
                    <Tooltip target="test-disabled">
                        Connect a Chat to this store to test and make sure it’s
                        not hidden. Testing is currently available for Chat
                        only.
                    </Tooltip>
                )}
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
                    isDisabled={isFetchPending}
                    intent="secondary"
                >
                    Save
                </Button>
                <Button
                    onClick={onPublish}
                    isLoading={isFetchPending || isPublishPending}
                    isDisabled={isFetchPending}
                >
                    Publish
                </Button>
                {!isDraft && (
                    <>
                        <IconButton
                            id="view-channel"
                            intent="secondary"
                            onClick={onViewChannel}
                        >
                            chat
                        </IconButton>
                        <Tooltip target="view-channel">
                            Display in channels
                        </Tooltip>
                    </>
                )}
            </>
        )
    }

    return (
        <>
            <Button
                onClick={() => onTest()}
                intent="secondary"
                isDisabled={isTestDisabled}
                id="test-disabled"
                leadingIcon="play_circle"
            >
                Test
            </Button>
            {isTestDisabled && (
                <Tooltip target="test-disabled">
                    Connect a Chat to this store to test and make sure it’s not
                    hidden. Testing is currently available for Chat only.
                </Tooltip>
            )}
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
                isDisabled={
                    isDraft ? isFetchPending : isFetchPending || !isDirty
                }
            >
                Publish
            </Button>
            {!isDraft && (
                <>
                    <IconButton
                        id="view-channel"
                        intent="secondary"
                        onClick={onViewChannel}
                    >
                        chat
                    </IconButton>
                    <Tooltip target="view-channel">Display in channels</Tooltip>
                </>
            )}
        </>
    )
}
