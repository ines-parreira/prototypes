import {Tooltip} from '@gorgias/ui-kit'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import IconButton from 'pages/common/components/button/IconButton'

import {ConfirmationButton} from './ConfirmationButton'

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
    const isPreviewTestButtonVisible =
        useFlags()[FeatureFlagKey.FlowsPreviewTestButton]
    const isPublishFlowFromFlowBuilder =
        useFlags()[FeatureFlagKey.PublishFlowFromFlowBuilder]

    if (isNewWorkflow) {
        return (
            <>
                {isPreviewTestButtonVisible && (
                    <Button
                        onClick={() => onTest()}
                        intent="secondary"
                        isDisabled={isTestDisabled}
                        id="test-disabled"
                    >
                        <ButtonIconLabel icon="play_circle" position="left">
                            Test
                        </ButtonIconLabel>
                    </Button>
                )}
                {isPreviewTestButtonVisible && isTestDisabled && (
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
                {isPublishFlowFromFlowBuilder && !isDraft && (
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
            {isPreviewTestButtonVisible && (
                <Button
                    onClick={() => onTest()}
                    intent="secondary"
                    isDisabled={isTestDisabled}
                    id="test-disabled"
                >
                    <ButtonIconLabel icon="play_circle" position="left">
                        Test
                    </ButtonIconLabel>
                </Button>
            )}
            {isPreviewTestButtonVisible && isTestDisabled && (
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
            {isPublishFlowFromFlowBuilder && !isDraft && (
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
