import { useCallback, useEffect, useRef } from 'react'

import { useEffectOnce } from '@repo/hooks'
import classnames from 'classnames'
import { useLocation } from 'react-router-dom'
import { Container } from 'reactstrap'

import { DateAndTimeFormatting } from 'constants/datetime'
import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import useAppSelector from 'hooks/useAppSelector'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { useSearch } from 'hooks/useSearch'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useSelfServiceConfigurationUpdate } from 'pages/automate/common/hooks/useSelfServiceConfigurationUpdate'
import {
    useSelfServiceStoreIntegrationContext,
    withSelfServiceStoreIntegrationContext,
} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import { mapServerErrorsToGraph } from 'pages/automate/workflows/utils/serverValidationErrors'
import PageHeader from 'pages/common/components/PageHeader'
import * as ToggleButton from 'pages/common/components/ToggleButton'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import TextInput from 'pages/common/forms/input/TextInput'
import { getTimezone } from 'state/currentUser/selectors'
import type { Notification } from 'state/notifications/types'
import { NotificationStatus } from 'state/notifications/types'
import { formatDatetime } from 'utils'

import { DraftBadge } from '../components/DraftBadge'
import WorkflowLanguageSelect from '../components/WorkflowLanguageSelect'
import { MAX_STORAGE_LIMIT_RATE_WARNING_THRESHOLD } from '../constants'
import { useStoreWorkflowsApi } from '../hooks/useStoreWorkflowsApi'
import useWorkflowChannelSupport, {
    WorkflowChannelSupportContext,
} from '../hooks/useWorkflowChannelSupport'
import {
    useWorkflowEditorContext,
    withWorkflowEditorContext,
} from '../hooks/useWorkflowEditor'
import {
    useWorkflowsIdsEnabledInChat,
    useWorkflowsIdsEnabledInContactForm,
    useWorkflowsIdsEnabledInHelpCenter,
} from '../hooks/useWorkflowEnabledInChannels'
import { transformWorkflowConfigurationIntoVisualBuilderGraph } from '../models/workflowConfiguration.model'
import {
    supportedLanguages,
    WorkflowToggle,
} from '../models/workflowConfiguration.types'
import { WORKFLOW_TEMPLATES } from '../workflowTemplates'
import WorkflowVisualBuilder from './visualBuilder/WorkflowVisualBuilder'
import { WorkflowEditorActionButtons } from './WorkflowEditorActionButtons'

import css from './WorkflowEditorView.less'

type WorkflowEditorViewProps = {
    shopType: string
    shopName: string
    workflowId: string
    isNewWorkflow: boolean
    onDiscard: (fromView: string | undefined) => void
    onSave?: () => void
    onNewWorkflowCreated: (isDraft: boolean) => void
    onPublish: () => void
    notifyMerchant: (message: Notification) => void
    goToWorkflowAnalyticsPage: (zoom: number) => void
    logActionOnFlowBuilder: (action: string) => void
}

function WorkflowEditorViewWrapped({
    workflowId,
    isNewWorkflow,
    onSave,
    onDiscard,
    onNewWorkflowCreated,
    onPublish,
    notifyMerchant,
    shopName,
    shopType,
    goToWorkflowAnalyticsPage,
    logActionOnFlowBuilder,
}: WorkflowEditorViewProps) {
    const { template: templateSlug, from: fromView } = useSearch<{
        template: string | undefined
        from: string | undefined
    }>()
    const workflowEditorContext = useWorkflowEditorContext()
    const location = useLocation<{ doShowDisplayInChannels: boolean }>()
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE,
    )

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortMonthDayWithTime,
    )
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
        [notifyMerchant],
    )

    const { handleSelfServiceConfigurationUpdate } =
        useSelfServiceConfigurationUpdate({
            handleNotify: notifyMerchant,
        })

    const { appendWorkflowInStore } = useStoreWorkflowsApi(handleNotify)

    const { id: storeIntegrationId } = useSelfServiceStoreIntegrationContext()

    const workflowChannelSupportContext = useWorkflowChannelSupport(
        shopType,
        shopName,
    )

    const canShowSizeLimitWarning = useRef(true)

    // flags
    const isDirty = workflowEditorContext.isDirty
    const isDraft = workflowEditorContext.configuration.is_draft
    const isFetchPending = workflowEditorContext.isFetchPending
    const isSavePending = workflowEditorContext.isSavePending
    const isPublishPending = workflowEditorContext.isPublishPending
    const isExistingDraft = !isNewWorkflow && isDraft

    const zoom = workflowEditorContext.zoom

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
                    message: `You've reached 90% of storage capacity for this flow. To avoid errors when saving and to keep things running smoothly, try removing unnecessary steps`,
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
                    message: `You've reached 90% of storage capacity for this flow. To avoid errors when saving and to keep things running smoothly, try keeping response text concise and removing unnecessary steps`,
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

    const handleDiscard = () => {
        workflowEditorContext.handleDiscard()
    }

    const handleTest = () => {
        const configurationError = !workflowEditorContext.handleValidate(true)

        if (configurationError) {
            notifyMerchant({
                message: 'Complete steps and save in order to test this Flow',
                status: NotificationStatus.Error,
            })
        } else if (isDirty) {
            notifyMerchant({
                message: 'Save as draft or publish in order to test this Flow',
                status: NotificationStatus.Error,
            })
        } else {
            workflowEditorContext.setIsTesting(true)
        }
    }

    const handleSave = () => upsertWorkflow(true)

    const handlePublish = () => upsertWorkflow(false)

    const openChannelSidePanel = useCallback(() => {
        workflowEditorContext.setFlowPublishingInChannels(true)
    }, [workflowEditorContext])
    const workflowsEnabledInChats = useWorkflowsIdsEnabledInChat(
        shopType,
        shopName,
    )
    const workflowsEnabledInHC = useWorkflowsIdsEnabledInHelpCenter(
        shopType,
        shopName,
    )
    const workflowsEnabledInCF = useWorkflowsIdsEnabledInContactForm(
        shopType,
        shopName,
    )

    const doOpenChannelsSidePanel = useCallback(
        (workflowId: string) => {
            if (workflowsEnabledInChats.has(workflowId)) return false
            if (workflowsEnabledInCF.has(workflowId)) return false
            if (workflowsEnabledInHC.has(workflowId)) return false
            return true
        },
        [workflowsEnabledInCF, workflowsEnabledInChats, workflowsEnabledInHC],
    )

    useEffectOnce(() => {
        if (
            location.state?.doShowDisplayInChannels &&
            doOpenChannelsSidePanel(workflowId)
        )
            openChannelSidePanel()
    })

    const upsertWorkflow = async (isDraft = true) => {
        if (!workflowEditorContext.handleValidate(isDraft)) {
            notifyMerchant({
                message: `Complete or delete incomplete steps in order to ${isDraft || !workflowEditorContext.configuration.is_draft ? 'save' : 'publish'}`,
                status: NotificationStatus.Error,
            })

            return
        }

        const error = workflowEditorContext.handleValidateSize()

        if (error) {
            notifyMerchant({
                message: error,
                status: NotificationStatus.Error,
            })

            return
        }

        const isFirstTimePublish =
            !isDraft && workflowEditorContext.configuration.is_draft

        try {
            if (isDraft) await workflowEditorContext.handleSave()
            else await workflowEditorContext.handlePublish()

            if (isNewWorkflow) {
                await appendWorkflowInStore(workflowId, storeIntegrationId)
            } else {
                // trigger channel cache invalidation to refresh the entrypoint labels and deleted translations on their side
                void handleSelfServiceConfigurationUpdate(
                    () => {
                        // update without modifying anything, just make it trigger channels cache invalidation
                    },
                    {
                        success: isFirstTimePublish
                            ? 'Flow successfully published. You can now enable it on the desired channels.'
                            : 'Successfully saved',
                    },
                    storeIntegrationId,
                )
            }
        } catch (error) {
            // Check if this is a server validation error by parsing it directly
            const graphWithServerErrors = mapServerErrorsToGraph(
                error,
                workflowEditorContext.visualBuilderGraph,
            )

            if (graphWithServerErrors) {
                notifyMerchant({
                    message:
                        'Please fix the validation errors below and try again',
                    status: NotificationStatus.Error,
                })
            } else {
                notifyMerchant({
                    message:
                        'An error happened trying to save the flow, please try again or contact support',
                    status: NotificationStatus.Error,
                })
            }
            return
        }

        if (!isDraft) {
            onPublish()
            if (isNewWorkflow) {
                onNewWorkflowCreated(isDraft)
            } else if (doOpenChannelsSidePanel(workflowId)) {
                openChannelSidePanel()
            }
        } else {
            onSave?.()
            if (isNewWorkflow) {
                onNewWorkflowCreated(isDraft)
            } else {
                logActionOnFlowBuilder('update')
            }
        }

        notify({
            isNewWorkflow,
            isFirstTimePublish,
        })
    }

    const notify = ({
        isNewWorkflow,
        isFirstTimePublish,
    }: {
        isNewWorkflow: boolean
        isFirstTimePublish: boolean
    }) => {
        if (isFirstTimePublish) {
            if (!isNewWorkflow) return
            notifyMerchant({
                message:
                    'Flow successfully published. You can now enable it on the desired channels.',
                status: NotificationStatus.Success,
                dismissAfter: 4000,
            })
        } else if (isNewWorkflow) {
            notifyMerchant({
                message: 'Successfully saved',
                status: NotificationStatus.Success,
            })
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
                storeIntegrationId,
            )
            workflowEditorContext.dispatch({
                type: 'RESET_GRAPH',
                graph: transformWorkflowConfigurationIntoVisualBuilderGraph(
                    configuration,
                ),
            })
        } else {
            const t = setTimeout(() => {
                inputRef.current?.focus()
            }, 300)
            return () => clearTimeout(t)
        }
    })

    const onToggleChange = (value: WorkflowToggle) => {
        if (value === WorkflowToggle.Analytics) {
            goToWorkflowAnalyticsPage(zoom)
        }
    }

    const showWorkflowAnalyticsToggle = !isNewWorkflow && !isDraft

    return (
        <WorkflowChannelSupportContext.Provider
            value={workflowChannelSupportContext}
        >
            <div className={css.page}>
                <PageHeader
                    className={css.pageHeader}
                    title={
                        <div className={css.headerLeft}>
                            <div className={css.headerInner}>
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
                                        !!workflowEditorContext
                                            .visualBuilderGraph.errors?.name
                                    }
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            inputRef.current?.blur()
                                        }
                                    }}
                                />
                                {isExistingDraft && <DraftBadge />}
                            </div>
                            <span
                                className={classnames(
                                    css.headerLeftDescription,
                                    {
                                        [css.isErrored]:
                                            !!workflowEditorContext
                                                .visualBuilderGraph.errors
                                                ?.name,
                                    },
                                )}
                            >
                                {workflowEditorContext.visualBuilderGraph.errors
                                    ?.name ||
                                    'Flow name will not be visible to customers'}
                            </span>
                        </div>
                    }
                >
                    <>
                        <div className={css.headerRight}>
                            <WorkflowLanguageSelect
                                available={
                                    workflowEditorContext.visualBuilderGraph
                                        .available_languages
                                }
                                selected={workflowEditorContext.currentLanguage}
                                onSelect={(lang) => {
                                    workflowEditorContext.switchLanguage(lang)
                                }}
                                onDelete={(lang) => {
                                    workflowEditorContext.deleteTranslation(
                                        lang,
                                    )
                                    notifyMerchant({
                                        message: `${
                                            supportedLanguages.find(
                                                ({ code }) => code === lang,
                                            )?.label ?? ''
                                        } language was successfully deleted`,
                                        status: NotificationStatus.Success,
                                    })
                                }}
                            />

                            <WorkflowEditorActionButtons
                                isTestDisabled={
                                    chatChannels.filter(
                                        (chat) =>
                                            !chat.value.deactivated_datetime &&
                                            !chat.value.deleted_datetime,
                                    ).length === 0
                                }
                                isNewWorkflow={isNewWorkflow}
                                isFetchPending={isFetchPending}
                                isSavePending={isSavePending}
                                isPublishPending={isPublishPending}
                                isDraft={isDraft}
                                isDirty={isDirty}
                                onTest={handleTest}
                                onCancel={() => onDiscard(fromView)}
                                onSave={handleSave}
                                onPublish={handlePublish}
                                onDiscard={handleDiscard}
                                onViewChannel={openChannelSidePanel}
                            />
                        </div>
                        {!isNewWorkflow &&
                            workflowEditorContext.configuration
                                .updated_datetime && (
                                <div className={css.lastSaved}>
                                    Last saved{' '}
                                    {formatDatetime(
                                        workflowEditorContext.configuration
                                            .updated_datetime,
                                        datetimeFormat,
                                        userTimezone,
                                    )}
                                </div>
                            )}
                        {!!workflowEditorContext.visualBuilderGraph.errors
                            ?.nodes && (
                            <div className={css.error}>
                                {
                                    workflowEditorContext.visualBuilderGraph
                                        .errors.nodes
                                }
                            </div>
                        )}
                    </>
                </PageHeader>
                <Container className={css.pageContainer} fluid>
                    {showWorkflowAnalyticsToggle && (
                        <ToggleButton.Wrapper
                            className={css.workflowToggle}
                            type={ToggleButton.Type.Label}
                            value={WorkflowToggle.Editor}
                            onChange={onToggleChange}
                        >
                            <ToggleButton.Option value={WorkflowToggle.Editor}>
                                Editor
                            </ToggleButton.Option>
                            <ToggleButton.Option
                                value={WorkflowToggle.Analytics}
                            >
                                Analysis
                            </ToggleButton.Option>
                        </ToggleButton.Wrapper>
                    )}
                    <WorkflowVisualBuilder
                        isNew={isNewWorkflow}
                        visualBuilderGraph={
                            workflowEditorContext.visualBuilderGraph
                        }
                        dispatch={workflowEditorContext.dispatch}
                    />
                </Container>
                <UnsavedChangesPrompt
                    onSave={() => (isDraft ? handleSave() : handlePublish())}
                    when={isDirty && !isSavePending}
                />
            </div>
        </WorkflowChannelSupportContext.Provider>
    )
}

export default withSelfServiceStoreIntegrationContext(
    withWorkflowEditorContext(WorkflowEditorViewWrapped),
)
