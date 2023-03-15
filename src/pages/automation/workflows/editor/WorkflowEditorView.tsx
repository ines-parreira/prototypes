import React, {PropsWithChildren, ReactNode} from 'react'
import {Container} from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import TextInput from 'pages/common/forms/input/TextInput'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import css from './WorkflowEditorView.less'
import useWorkflowConfiguration from './hooks/useWorkflowConfiguration'
import WorkflowVisualBuilder from './visualBuilder/WorkflowVisualBuilder'
import {
    withWorkflowEntrypointContext,
    useWorkflowEntrypointContext,
} from './hooks/useWorkflowEntrypoint'

type WorkflowEditorViewProps = {
    shopType: string
    shopName: string
    workflowId: string
    isNewWorkflow: boolean
    goToWorkflowsListPage: () => void
    notifyMerchant: (message: string, kind: 'success' | 'error') => void
}

const discardChangeConfirmationText = <>Your changes will be lost</>

function WorkflowEditorViewWrapped({
    workflowId,
    isNewWorkflow,
    goToWorkflowsListPage,
    notifyMerchant,
}: WorkflowEditorViewProps) {
    const worfklowConfigurationHook = useWorkflowConfiguration(
        workflowId,
        isNewWorkflow
    )
    const workflowEntrypointContext = useWorkflowEntrypointContext()

    // flags
    const isDirty =
        worfklowConfigurationHook.isDirty || workflowEntrypointContext.isDirty
    const validationError =
        worfklowConfigurationHook.validationError ??
        workflowEntrypointContext.validationError
    const isFetchPending =
        worfklowConfigurationHook.isFetchPending ||
        workflowEntrypointContext.isFetchPending
    const isSavePending =
        worfklowConfigurationHook.isSavePending ||
        workflowEntrypointContext.isSavePending
    const shouldShowErrors =
        worfklowConfigurationHook.shouldShowErrors ||
        workflowEntrypointContext.shouldShowErrors

    // handlers
    const handleDiscard = () => {
        worfklowConfigurationHook.handleDiscard()
        workflowEntrypointContext.handleDiscard()
    }
    const handleCancel = () => {
        goToWorkflowsListPage()
    }
    const handleSave = async () => {
        await worfklowConfigurationHook.handleSave()
        await workflowEntrypointContext.handleSave()
        if (validationError) {
            notifyMerchant(validationError, 'error')
            return
        }
        notifyMerchant(
            isNewWorkflow
                ? 'Flow successfully created'
                : 'Flow successfully updated',
            'success'
        )
        goToWorkflowsListPage()
    }

    return (
        <div className={css.page}>
            <PageHeader
                className={css.pageHeader}
                title={
                    <div className={css.headerLeft}>
                        <TextInput
                            autoFocus={isNewWorkflow}
                            className={css.headerLeftInput}
                            isRequired
                            onChange={(name) => {
                                worfklowConfigurationHook.setWorkflowName(name)
                            }}
                            placeholder="Add flow name"
                            value={worfklowConfigurationHook.configuration.name}
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
                                confirmationText={discardChangeConfirmationText}
                                isDisabled={!isDirty}
                                onClick={handleCancel}
                            >
                                Cancel
                            </ButtonWithConfirmation>
                            <Button onClick={handleSave} isDisabled={!isDirty}>
                                Create flow
                            </Button>
                        </>
                    ) : (
                        <>
                            <ButtonWithConfirmation
                                confirmationText={discardChangeConfirmationText}
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
            <Container className={css.pageContainer} fluid>
                <WorkflowVisualBuilder />
            </Container>
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

export default withWorkflowEntrypointContext(WorkflowEditorViewWrapped)
