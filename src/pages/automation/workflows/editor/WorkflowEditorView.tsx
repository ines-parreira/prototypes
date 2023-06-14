import React, {PropsWithChildren, ReactNode, useRef, useState} from 'react'
import {Container} from 'reactstrap'
import {useEffectOnce} from 'react-use'

import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import TextInput from 'pages/common/forms/input/TextInput'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import useSearch from 'hooks/useSearch'
import {Notification, NotificationStatus} from 'state/notifications/types'

import {WORKFLOW_TEMPLATES} from '../constants'
import {
    useWorkflowConfigurationContext,
    withWorkflowConfigurationContext,
} from './hooks/useWorkflowConfiguration'
import WorkflowVisualBuilder from './visualBuilder/WorkflowVisualBuilder'
import {
    useWorkflowEntrypointContext,
    withWorkflowEntrypointContext,
} from './hooks/useWorkflowEntrypoint'

import css from './WorkflowEditorView.less'

type WorkflowEditorViewProps = {
    currentAccountId: number
    shopType: string
    shopName: string
    workflowId: string
    isNewWorkflow: boolean
    goToWorkflowsListPage: () => void
    goToWorkflowTemplatesPage: () => void
    goToConnectedChannelsPage: () => void
    notifyMerchant: (message: Notification) => void
}

function WorkflowEditorViewWrapped({
    currentAccountId,
    workflowId,
    isNewWorkflow,
    goToWorkflowsListPage,
    goToWorkflowTemplatesPage,
    goToConnectedChannelsPage,
    notifyMerchant,
}: WorkflowEditorViewProps) {
    const {template: templateSlug} = useSearch<{template: string | undefined}>()
    const worfklowConfigurationContext = useWorkflowConfigurationContext()
    const workflowEntrypointContext = useWorkflowEntrypointContext()

    // flags
    const isDirty =
        worfklowConfigurationContext.isDirty ||
        workflowEntrypointContext.isDirty
    const isFetchPending =
        worfklowConfigurationContext.isFetchPending ||
        workflowEntrypointContext.isFetchPending
    const isSavePending =
        worfklowConfigurationContext.isSavePending ||
        workflowEntrypointContext.isSavePending
    const [lastSaveAttempt, setLastSaveAttempt] = useState<Date | undefined>(
        undefined
    )
    const workflowNameisErrored =
        worfklowConfigurationContext.configuration.name.trim().length === 0 ||
        worfklowConfigurationContext.configuration.name.length > 100

    // handlers
    const handleDiscard = () => {
        worfklowConfigurationContext.handleDiscard()
        workflowEntrypointContext.handleDiscard()
    }
    const handleCancel = () => {
        goToWorkflowTemplatesPage()
    }
    const handleSave = async () => {
        const entrypointError = workflowEntrypointContext.handleValidate()
        const configurationError = worfklowConfigurationContext.handleValidate()
        const validationError = configurationError || entrypointError
        if (validationError) {
            setLastSaveAttempt(new Date())
            notifyMerchant({
                message: validationError,
                status: NotificationStatus.Error,
            })
            return
        }
        try {
            await worfklowConfigurationContext.handleSave()
            await workflowEntrypointContext.handleSave()
        } catch (e) {
            notifyMerchant({
                message:
                    'An error happened trying to save the flow, please try again or contact support',
                status: NotificationStatus.Error,
            })
            return
        }

        if (isNewWorkflow) {
            notifyMerchant({
                message:
                    'Flow successfully created. Select the desired channel to enable and arrange flows.',
                status: NotificationStatus.Success,
                dismissAfter: 4000,
            })
            goToConnectedChannelsPage()
        } else {
            notifyMerchant({
                message: isNewWorkflow
                    ? 'Successfully created'
                    : 'Successfully updated',
                status: NotificationStatus.Success,
            })
            goToWorkflowsListPage()
        }
    }

    const inputRef = useRef<HTMLInputElement>(null)

    useEffectOnce(() => {
        if (!isNewWorkflow) {
            return
        }

        if (templateSlug && templateSlug in WORKFLOW_TEMPLATES) {
            const template = WORKFLOW_TEMPLATES[templateSlug]
            const configuration = template.getConfiguration(
                workflowId,
                currentAccountId
            )
            worfklowConfigurationContext.dispatch({
                type: 'RESET_CONFIGURATION',
                configuration,
            })
            if (configuration.entrypoint?.label) {
                workflowEntrypointContext.setLabel(
                    configuration.entrypoint?.label
                )
            }
        } else {
            const t = setTimeout(() => {
                inputRef.current?.focus()
            }, 300)
            return () => clearTimeout(t)
        }
    })

    return (
        <div className={css.page}>
            <PageHeader
                className={css.pageHeader}
                title={
                    <div className={css.headerLeft}>
                        <TextInput
                            ref={inputRef}
                            className={css.headerLeftInput}
                            isRequired
                            onChange={(name) => {
                                worfklowConfigurationContext.dispatch({
                                    type: 'SET_NAME',
                                    name,
                                })
                            }}
                            placeholder={
                                !isNewWorkflow &&
                                worfklowConfigurationContext.isFetchPending
                                    ? '...'
                                    : 'Add flow name'
                            }
                            value={
                                worfklowConfigurationContext.configuration.name
                            }
                            isDisabled={isFetchPending || isSavePending}
                            hasError={lastSaveAttempt && workflowNameisErrored}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    inputRef.current?.blur()
                                }
                            }}
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
                            <Button
                                onClick={handleCancel}
                                isLoading={isFetchPending}
                                intent="secondary"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                isLoading={isFetchPending || isSavePending}
                                isDisabled={!isDirty}
                            >
                                Create flow
                            </Button>
                        </>
                    ) : (
                        <>
                            <ButtonWithConfirmation
                                confirmationButtonLabel="Discard Changes"
                                confirmationTitle="Discard changes?"
                                confirmationText="Your changes will be lost and this action cannot be undone"
                                isDisabled={
                                    !isDirty || isFetchPending || isSavePending
                                }
                                onClick={handleDiscard}
                            >
                                Discard Changes
                            </ButtonWithConfirmation>
                            <Button
                                onClick={handleSave}
                                isLoading={isFetchPending || isSavePending}
                            >
                                Save & Close
                            </Button>
                        </>
                    )}
                </div>
            </PageHeader>
            <Container className={css.pageContainer} fluid>
                <WorkflowVisualBuilder lastSaveAttempt={lastSaveAttempt} />
            </Container>
            <UnsavedChangesPrompt
                onSave={handleSave}
                when={isDirty && !isSavePending}
            />
        </div>
    )
}

function ButtonWithConfirmation({
    confirmationButtonLabel,
    confirmationTitle,
    confirmationText,
    isDisabled,
    onClick,
    children,
}: PropsWithChildren<{
    confirmationButtonLabel?: string
    confirmationTitle: ReactNode
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
                intent: 'destructive',
            }}
            cancelButtonProps={{intent: 'secondary'}}
            onConfirm={onClick}
            showCancelButton={true}
            confirmLabel={confirmationButtonLabel}
            title={confirmationTitle}
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

export default withWorkflowConfigurationContext(
    withWorkflowEntrypointContext(WorkflowEditorViewWrapped)
)
