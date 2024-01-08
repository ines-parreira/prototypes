import React, {useCallback, useEffect, useRef} from 'react'
import {Container} from 'reactstrap'

import {useFlags} from 'launchdarkly-react-client-sdk'
import PageHeader from 'pages/common/components/PageHeader'
import TextInput from 'pages/common/forms/input/TextInput'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {
    useSelfServiceStoreIntegrationContext,
    withSelfServiceStoreIntegrationContext,
} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'

import useSearch from 'hooks/useSearch'
import useEffectOnce from 'hooks/useEffectOnce'
import {Notification, NotificationStatus} from 'state/notifications/types'

import {useSelfServiceConfigurationUpdate} from 'pages/automate/common/hooks/useSelfServiceConfigurationUpdate'
import {formatDatetime} from 'utils'
import {DateAndTimeFormatting} from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import {FeatureFlagKey} from 'config/featureFlags'
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
import {DraftBadge} from '../components/DraftBadge'
import WorkflowVisualBuilder from './visualBuilder/WorkflowVisualBuilder'

import css from './WorkflowEditorView.less'
import {WorkflowEditorActionButtons} from './WorkflowEditorActionButtons'

type WorkflowEditorViewProps = {
    currentAccountId: number
    shopType: string
    shopName: string
    workflowId: string
    isNewWorkflow: boolean
    onDiscard: (fromView: string | undefined) => void
    onSave?: () => void
    onDraftCreated: () => void
    onPublish: (isFirstTime: boolean) => void
    notifyMerchant: (message: Notification) => void
}

function WorkflowEditorViewWrapped({
    currentAccountId,
    workflowId,
    isNewWorkflow,
    onSave,
    onDiscard,
    onDraftCreated,
    onPublish,
    notifyMerchant,
    shopName,
    shopType,
}: WorkflowEditorViewProps) {
    const {template: templateSlug, from: fromView} =
        useSearch<{template: string | undefined; from: string | undefined}>()
    const workflowEditorContext = useWorkflowEditorContext()
    const areFlowsDraftsEnabled = Boolean(
        useFlags()[FeatureFlagKey.FlowsDrafts]
    )

    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortMonthDayWithTime
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
    const isDraft = workflowEditorContext.configuration.is_draft
    const isFetchPending = workflowEditorContext.isFetchPending
    const isSavePending = workflowEditorContext.isSavePending
    const isPublishPending = workflowEditorContext.isPublishPending
    const isExistingDraft = !isNewWorkflow && isDraft
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

    const handleDiscard = () => {
        workflowEditorContext.handleDiscard()
    }

    const handleSave = () =>
        upsertWorkflow(areFlowsDraftsEnabled ? true : false)

    const handlePublish = () => upsertWorkflow(false)

    const upsertWorkflow = async (
        isDraft = areFlowsDraftsEnabled ? true : false
    ) => {
        const configurationError = workflowEditorContext.handleValidate(
            !isDraft
        )
        if (configurationError) {
            workflowEditorContext.setShouldShowErrors(true)
            notifyMerchant({
                message: configurationError,
                status: NotificationStatus.Error,
            })
            return
        }

        if (!storeIntegrationId) return
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

        if (!isDraft) {
            onPublish(isFirstTimePublish)
        } else if (isDraft) {
            if (isNewWorkflow) onDraftCreated()
            else onSave?.()
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
                currentAccountId,
                storeIntegrationId
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
                                        workflowEditorContext.shouldShowErrors &&
                                        workflowNameIsErrored
                                    }
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            inputRef.current?.blur()
                                        }
                                    }}
                                />
                                {isExistingDraft && <DraftBadge />}
                            </div>
                            <span className={css.headerLeftdescription}>
                                Flow name will not be visible to customers
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

                            <WorkflowEditorActionButtons
                                isNewWorkflow={isNewWorkflow}
                                areDraftsEnabled={areFlowsDraftsEnabled}
                                isFetchPending={isFetchPending}
                                isSavePending={isSavePending}
                                isPublishPending={isPublishPending}
                                isDraft={isDraft}
                                isDirty={isDirty}
                                onCancel={() => onDiscard(fromView)}
                                onSave={handleSave}
                                onPublish={handlePublish}
                                onDiscard={handleDiscard}
                            />
                        </div>
                        {!isNewWorkflow &&
                            workflowEditorContext.configuration
                                .updated_datetime &&
                            areFlowsDraftsEnabled && (
                                <div className={css.lastSaved}>
                                    Last saved{' '}
                                    {formatDatetime(
                                        workflowEditorContext.configuration
                                            .updated_datetime,
                                        datetimeFormat,
                                        userTimezone
                                    )}
                                </div>
                            )}
                    </>
                </PageHeader>
                <Container className={css.pageContainer} fluid>
                    <WorkflowVisualBuilder />
                </Container>
                <UnsavedChangesPrompt
                    onSave={() => (isDraft ? handleSave() : handlePublish())}
                    when={isDirty && !isSavePending}
                />
            </div>
        </WorkflowChannelSupportContext.Provider>
    )
}

export default withWorkflowEditorContext(
    withSelfServiceStoreIntegrationContext(WorkflowEditorViewWrapped)
)
