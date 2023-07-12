import React, {
    PropsWithChildren,
    ReactNode,
    useCallback,
    useRef,
    useState,
} from 'react'
import {Container} from 'reactstrap'
import {useEffectOnce} from 'react-use'

import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import TextInput from 'pages/common/forms/input/TextInput'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {withSelfServiceStoreIntegrationContext} from 'pages/automation/common/hooks/useSelfServiceStoreIntegration'
import useSearch from 'hooks/useSearch'
import {Notification, NotificationStatus} from 'state/notifications/types'

import {WORKFLOW_TEMPLATES} from '../constants'
import useStoreWorkflows from '../hooks/useStoreWorkflows'
import {
    useWorkflowEditorContext,
    withWorkflowEditorContext,
} from '../hooks/useWorkflowEditor'
import useWorkflowChannelSupport, {
    WorkflowChannelSupportContext,
} from '../hooks/useWorkflowChannelSupport'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import WorkflowVisualBuilder from './visualBuilder/WorkflowVisualBuilder'

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
    shopName,
    shopType,
}: WorkflowEditorViewProps) {
    const {template: templateSlug} = useSearch<{template: string | undefined}>()
    const workflowEditorContext = useWorkflowEditorContext()
    const {appendWorkflowInStore} = useStoreWorkflows(
        shopType,
        shopName,
        useCallback(
            (message: string, kind: 'success' | 'error') => {
                void notifyMerchant({
                    message,
                    status:
                        kind === 'success'
                            ? NotificationStatus.Success
                            : NotificationStatus.Error,
                })
            },
            [notifyMerchant]
        )
    )
    const workflowChannelSupportContext = useWorkflowChannelSupport(
        shopType,
        shopName
    )

    // flags
    const isDirty = workflowEditorContext.isDirty
    const isFetchPending = workflowEditorContext.isFetchPending
    const isSavePending = workflowEditorContext.isSavePending
    const [workflowNameisErrored, setWorkflowNameIsErrored] = useState(false)

    // handlers
    const handleDiscard = () => {
        workflowEditorContext.handleDiscard()
    }
    const handleCancel = () => {
        goToWorkflowTemplatesPage()
    }
    const handleSave = async () => {
        const configurationError = workflowEditorContext.handleValidate()
        if (configurationError) {
            setWorkflowNameIsErrored(
                workflowEditorContext.visualBuilderGraph.name.trim().length ===
                    0 ||
                    workflowEditorContext.visualBuilderGraph.name.length > 100
            )
            workflowEditorContext.dispatch({
                type: 'SET_SHOULD_SHOW_ERRORS',
                shouldShowErrors: true,
            })
            notifyMerchant({
                message: configurationError,
                status: NotificationStatus.Error,
            })
            return
        }
        try {
            await workflowEditorContext.handleSave()
            if (isNewWorkflow) {
                await appendWorkflowInStore(workflowId)
            }
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
            workflowEditorContext.dispatch({
                type: 'RESET_GRAPH',
                graph: transformWorkflowConfigurationIntoVisualBuilderGraph(
                    configuration
                ),
            })
        } else {
            const t = setTimeout(() => {
                inputRef.current?.focus()
            }, 300)
            return () => clearTimeout(t)
        }
    })

    return (
        <WorkflowChannelSupportContext.Provider
            value={workflowChannelSupportContext}
        >
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
                                    workflowEditorContext.dispatch({
                                        type: 'SET_NAME',
                                        name,
                                    })
                                }}
                                placeholder={
                                    !isNewWorkflow &&
                                    workflowEditorContext.isFetchPending
                                        ? '...'
                                        : 'Add flow name'
                                }
                                value={
                                    workflowEditorContext.visualBuilderGraph
                                        .name
                                }
                                isDisabled={isFetchPending || isSavePending}
                                hasError={workflowNameisErrored}
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
                                        !isDirty ||
                                        isFetchPending ||
                                        isSavePending
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
                    <WorkflowVisualBuilder />
                </Container>
                <UnsavedChangesPrompt
                    onSave={handleSave}
                    when={isDirty && !isSavePending}
                />
            </div>
        </WorkflowChannelSupportContext.Provider>
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

export default withWorkflowEditorContext(
    withSelfServiceStoreIntegrationContext(WorkflowEditorViewWrapped)
)
