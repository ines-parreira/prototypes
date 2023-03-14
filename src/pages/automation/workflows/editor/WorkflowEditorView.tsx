import React, {PropsWithChildren, ReactNode, useMemo, useState} from 'react'
import {Container} from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import TextInput from 'pages/common/forms/input/TextInput'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import css from './WorkflowEditorView.less'
import useWorkflowConfiguration from './hooks/useWorkflowConfiguration'

type WorkflowEditorViewProps = {
    editWorkflowId: Maybe<string>
    goToWorkflowsListPage: () => void
    notifyMerchant: (message: string, kind: 'success' | 'error') => void
}

const discardChangeConfirmationText = <>Your changes will be lost</>

export default function WorkflowEditorView({
    editWorkflowId,
    goToWorkflowsListPage,
    notifyMerchant,
}: WorkflowEditorViewProps) {
    const isNewWorkflow = editWorkflowId == null
    // memoizing to get a stable workflowId across rerenders
    // use hard coded workflow id temporarily to ease testing of edit page: https://acme.gorgias.docker/app/automation/shopify/cyprien-pannier/flows/edit/01GV2Y97453JW81MWFHF4NA2F4
    const workflowId = useMemo(
        () => editWorkflowId ?? '01GV2Y97453JW81MWFHF4NA2F4', // ulid()
        [editWorkflowId]
    )
    const worfklowConfigurationHook = useWorkflowConfiguration(
        workflowId,
        isNewWorkflow
    )
    // todo workflowEntrypointHook (needed for the trigger button text edition)

    // flags
    const [shouldShowErrors, setShouldShowErrors] = useState(false)
    const isDirty = worfklowConfigurationHook.isDirty
    const validationError = worfklowConfigurationHook.validationError
    const isFetchPending = worfklowConfigurationHook.isFetchPending
    const isSavePending = worfklowConfigurationHook.isSavePending

    // handlers
    const handleDiscard = () => {
        worfklowConfigurationHook.handleDiscard()
    }
    const handleCancel = () => {
        goToWorkflowsListPage()
    }
    const handleSave = async () => {
        if (validationError) {
            notifyMerchant(validationError, 'error')
            setShouldShowErrors(true)
            return
        }
        await worfklowConfigurationHook.handleSave()
        notifyMerchant(
            isNewWorkflow
                ? 'Flow successfully created'
                : 'Flow successfully updated',
            'success'
        )
        goToWorkflowsListPage()
    }

    return (
        <div className="full-width overflow-auto">
            <div className={css.pageHeaderContainer}>
                <PageHeader
                    title={
                        <div className={css.headerLeft}>
                            <TextInput
                                autoFocus={isNewWorkflow}
                                className={css.headerLeftInput}
                                isRequired
                                onChange={(name) => {
                                    worfklowConfigurationHook.setWorkflowName(
                                        name
                                    )
                                }}
                                placeholder="Add flow name"
                                value={
                                    worfklowConfigurationHook.configuration.name
                                }
                                isDisabled={isFetchPending || isSavePending}
                                hasError={
                                    shouldShowErrors &&
                                    worfklowConfigurationHook.configuration.name.trim()
                                        .length === 0
                                }
                            />
                            <span className={css.headerLeftdescription}>
                                Flow name will not be visible to customers
                            </span>
                        </div>
                    }
                >
                    <div className={css.headerRight}>
                        {isNewWorkflow ? (
                            <>
                                <ButtonWithConfirmation
                                    confirmationText={
                                        discardChangeConfirmationText
                                    }
                                    isDisabled={!isDirty}
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </ButtonWithConfirmation>
                                <Button
                                    onClick={handleSave}
                                    isDisabled={!isDirty}
                                >
                                    Create flow
                                </Button>
                            </>
                        ) : (
                            <>
                                <ButtonWithConfirmation
                                    confirmationText={
                                        discardChangeConfirmationText
                                    }
                                    isDisabled={!isDirty || isSavePending}
                                    onClick={handleDiscard}
                                >
                                    Discard Changes
                                </ButtonWithConfirmation>
                                <Button
                                    onClick={handleSave}
                                    isLoading={isSavePending}
                                    isDisabled={!isDirty}
                                >
                                    Save & Close
                                </Button>
                            </>
                        )}
                    </div>
                </PageHeader>
                <Container fluid></Container>
            </div>
        </div>
    )
}

function ButtonWithConfirmation({
    confirmationText,
    isDisabled,
    onClick,
    children,
}: PropsWithChildren<{
    confirmationText: ReactNode
    isDisabled: boolean
    onClick: () => void
}>) {
    if (isDisabled)
        return (
            <Button intent="secondary" isDisabled={true}>
                {children}
            </Button>
        )
    return (
        <ConfirmationPopover
            buttonProps={{
                intent: 'secondary',
            }}
            onConfirm={onClick}
            showCancelButton={true}
            content={confirmationText}
        >
            {({uid, onDisplayConfirmation}) => (
                <Button
                    id={uid}
                    intent="secondary"
                    onClick={onDisplayConfirmation}
                >
                    {children}
                </Button>
            )}
        </ConfirmationPopover>
    )
}
