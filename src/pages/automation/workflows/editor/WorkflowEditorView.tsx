import React, {
    PropsWithChildren,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
} from 'react'
import {Container} from 'reactstrap'
import {useEffectOnce} from 'react-use'

import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import TextInput from 'pages/common/forms/input/TextInput'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {
    useSelfServiceStoreIntegrationContext,
    withSelfServiceStoreIntegrationContext,
} from 'pages/automation/common/hooks/useSelfServiceStoreIntegration'

import useSearch from 'hooks/useSearch'
import {Notification, NotificationStatus} from 'state/notifications/types'

import {useSelfServiceConfigurationUpdate} from 'pages/automation/common/hooks/useSelfServiceConfigurationUpdate'
import {supportedLanguages} from '../models/workflowConfiguration.types'
import {MAX_STORAGE_LIMIT_RATE_WARNING_THRESHOLD} from '../constants'
import {
    useWorkflowEditorContext,
    withWorkflowEditorContext,
} from '../hooks/useWorkflowEditor'
import useWorkflowChannelSupport, {
    WorkflowChannelSupportContext,
} from '../hooks/useWorkflowChannelSupport'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import WorkflowLanguageSelect from '../components/WorkflowLanguageSelect'

import {useStoreWorkflowsApi} from '../hooks/useStoreWorkflowsApi'
import {WORKFLOW_TEMPLATES} from '../workflowTemplates'
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

    const handleNotify = useCallback(
        (message: string, kind: 'success' | 'error') => {
            notifyMerchant({
                message,
                status:
                    kind === 'success'
                        ? NotificationStatus.Success
                        : NotificationStatus.Error,
            })
        },
        [notifyMerchant]
    )

    const {handleSelfServiceConfigurationUpdate} =
        useSelfServiceConfigurationUpdate({
            handleNotify: notifyMerchant,
        })

    const {appendWorkflowInStore} = useStoreWorkflowsApi(handleNotify)

    const {id: storeIntegrationId} = useSelfServiceStoreIntegrationContext()

    const workflowChannelSupportContext = useWorkflowChannelSupport(
        shopType,
        shopName
    )

    const canShowSizeLimitWarning = useRef(true)

    // flags
    const isDirty = workflowEditorContext.isDirty
    const isFetchPending = workflowEditorContext.isFetchPending
    const isSavePending = workflowEditorContext.isSavePending
    const workflowNameIsErrored =
        workflowEditorContext.visualBuilderGraph.name.trim().length === 0 ||
        workflowEditorContext.visualBuilderGraph.name.length > 100

    useEffect(() => {
        if (!isDirty) {
            return
        }

        if (
            workflowEditorContext.configurationSizeToLimitRate >=
            MAX_STORAGE_LIMIT_RATE_WARNING_THRESHOLD
        ) {
            if (canShowSizeLimitWarning.current) {
                notifyMerchant({
                    message: `You've reached 75% of storage capacity for this flow. To avoid errors when saving and to keep things running smoothly, try removing unnecessary steps`,
                    status: NotificationStatus.Warning,
                })
                canShowSizeLimitWarning.current = false
            }
        } else if (
            workflowEditorContext.translationSizeToLimitRate >=
            MAX_STORAGE_LIMIT_RATE_WARNING_THRESHOLD
        ) {
            if (canShowSizeLimitWarning.current) {
                notifyMerchant({
                    message: `You've reached 75% of storage capacity for this flow. To avoid errors when saving and to keep things running smoothly, try keeping response text concise and removing unnecessary steps`,
                    status: NotificationStatus.Warning,
                })
                canShowSizeLimitWarning.current = false
            }
        } else {
            canShowSizeLimitWarning.current = true
        }
    }, [
        isDirty,
        workflowEditorContext.configurationSizeToLimitRate,
        workflowEditorContext.translationSizeToLimitRate,
        notifyMerchant,
    ])

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
            workflowEditorContext.setShouldShowErrors(true)
            notifyMerchant({
                message: configurationError,
                status: NotificationStatus.Error,
            })
            return
        }
        if (!storeIntegrationId) return
        try {
            await workflowEditorContext.handleSave()
            if (isNewWorkflow) {
                await appendWorkflowInStore(workflowId, storeIntegrationId)
            } else {
                // trigger channel cache invalidation to refresh the entrypoint labels and deleted translations on their side
                void handleSelfServiceConfigurationUpdate(
                    () => {
                        // update without modifying anything, just make it trigger channels cache invalidation
                    },
                    {},
                    storeIntegrationId
                )
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
                                isDisabled={isFetchPending}
                                hasError={
                                    workflowEditorContext.shouldShowErrors &&
                                    workflowNameIsErrored
                                }
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
                        <>
                            <WorkflowLanguageSelect
                                available={
                                    workflowEditorContext.visualBuilderGraph
                                        .available_languages || ['en-US']
                                }
                                selected={workflowEditorContext.currentLanguage}
                                onSelect={(lang) => {
                                    workflowEditorContext.switchLanguage(lang)
                                }}
                                onDelete={(lang) => {
                                    workflowEditorContext.deleteTranslation(
                                        lang
                                    )
                                    notifyMerchant({
                                        message: `${
                                            supportedLanguages.find(
                                                ({code}) => code === lang
                                            )?.label ?? ''
                                        } language was successfully deleted`,
                                        status: NotificationStatus.Success,
                                    })
                                }}
                            />
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
                                        isLoading={
                                            isFetchPending || isSavePending
                                        }
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
                                        isLoading={
                                            isFetchPending || isSavePending
                                        }
                                    >
                                        Save & Close
                                    </Button>
                                </>
                            )}
                        </>
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
