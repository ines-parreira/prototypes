import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { QUICK_REPLIES_DEFAULTS } from 'config/integrations/gorgias_chat'
import useAppDispatch from 'hooks/useAppDispatch'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { useListWorkflowEntryPoints } from 'models/workflows/queries'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import { AutomateFeatures } from 'pages/automate/common/types'
import useIsQuickRepliesEnabled from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationQuickReplies/hooks/useIsQuickRepliesEnabled'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { FlowsCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/FlowsCard/FlowsCard'
import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout'
import { useFlows } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useFlows'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'
import { updateOrCreateIntegration } from 'state/integrations/actions'

import { ArticleRecommendationCard } from './components/ArticleRecommendationCard/ArticleRecommendationCard'
import { ConnectedChannelsEmptyView } from './components/ConnectedChannelsEmptyView/ConnectedChannelsEmptyView'
import type { Workflow } from './components/FlowsCard/types'
import SaveChangesPrompt from './components/GorgiasChatCreationWizard/components/SaveChangesPrompt'
import { OrderManagementCard } from './components/OrderManagementCard/OrderManagementCard'
import { QuickRepliesCard } from './components/QuickRepliesCard/QuickRepliesCard'
import { useArticleRecommendation } from './hooks/useArticleRecommendation'
import { useOrderManagement } from './hooks/useOrderManagement'

import css from './GorgiasAutomateChatIntegration.less'

type Props = {
    integration: Map<any, any>
}

export const GorgiasAutomateChatIntegrationRevamp = ({
    integration,
}: Props) => {
    const dispatch = useAppDispatch()
    const { isConnected } = useStoreIntegration(integration)
    const gorgiasChatIntegration = integration.toJS() as GorgiasChatIntegration
    const appId = gorgiasChatIntegration?.meta?.app_id
    const isQuickRepliesEnabled = useIsQuickRepliesEnabled()

    const {
        updateWorkflowEntryPoints,
        reloadPreview,
        displayPage,
        updateQuickReplies,
    } = useChatPreviewPanelContext()

    const {
        applicationsAutomationSettings,
        isUpdatePending: isSaving,
        handleChatApplicationAutomationSettingsUpdate,
    } = useApplicationsAutomationSettings(appId ? [appId] : [])

    const serverSettings = appId
        ? applicationsAutomationSettings?.[appId]
        : undefined

    const [pendingOrderManagement, setPendingOrderManagement] = useState<
        boolean | null
    >(null)
    const [pendingArticleRecommendation, setPendingArticleRecommendation] =
        useState<boolean | null>(null)
    const [pendingFlows, setPendingFlows] = useState<Workflow[] | null>(null)
    const [pendingQuickReplies, setPendingQuickReplies] = useState<{
        enabled: boolean
        replies: string[]
    } | null>(null)

    const {
        enabledInSettings: articleRecommendationEnabledInSettings,
        isArticleRecommendationEnabled: serverArticleRecommendationEnabled,
        isDisabled: isArticleRecommendationDisabled,
        isLoading: isArticleRecommendationLoading,
        showHelpCenterRequired,
    } = useArticleRecommendation({ integration })

    const {
        enabledInSettings: orderManagementEnabledInSettings,
        isOrderManagementEnabled: serverOrderManagementEnabled,
        isDisabled: isOrderManagementDisabled,
        isLoading: isOrderManagementLoading,
        showStoreRequired,
        orderManagementUrl,
    } = useOrderManagement({ integration })

    const {
        isLoading: isFlowsLoading,
        shopName,
        shopType,
        channel,
        primaryLanguage,
        workflowEntrypoints,
        workflowConfigurations,
        automationSettingsWorkflows,
    } = useFlows({ integration })

    const serverQuickReplies = useMemo(() => {
        const meta = gorgiasChatIntegration?.meta?.quick_replies
        return {
            enabled: meta?.enabled ?? false,
            replies:
                meta?.replies?.length && meta?.replies?.length > 0
                    ? meta.replies
                    : (QUICK_REPLIES_DEFAULTS.toJS() as string[]),
        }
    }, [gorgiasChatIntegration?.meta?.quick_replies])

    const currentQuickReplies = pendingQuickReplies ?? serverQuickReplies

    const handleQuickRepliesChange = useCallback(
        (data: { enabled: boolean; replies: string[] }) => {
            setPendingQuickReplies(data)
            updateQuickReplies(data)
        },
        [updateQuickReplies],
    )

    const { data: entrypointsLabels, isLoading: isEntrypointsLabelsLoading } =
        useListWorkflowEntryPoints({
            ids: (pendingFlows || []).map((flow) => flow.workflow_id),
            language: primaryLanguage,
        })

    const handleFlowsChange = (updatedWorkflows: Workflow[]) => {
        setPendingFlows(updatedWorkflows)
    }

    useEffect(() => {
        if (pendingFlows === null) return
        if (!isEntrypointsLabelsLoading || pendingFlows.length === 0) {
            const workflowEntryPoints = pendingFlows
                .map((flow) => ({
                    workflow_id: flow.workflow_id,
                    language: primaryLanguage,
                    label: entrypointsLabels?.[flow.workflow_id],
                }))
                .filter((flow) => flow.label)

            updateWorkflowEntryPoints(workflowEntryPoints)
        }
    }, [
        pendingFlows,
        primaryLanguage,
        entrypointsLabels,
        isEntrypointsLabelsLoading,
        updateWorkflowEntryPoints,
    ])

    useEffect(() => {
        displayPage('homepage')
    }, [reloadPreview, displayPage])

    const isOrderManagementEnabled =
        pendingOrderManagement ?? serverOrderManagementEnabled
    const isArticleRecommendationEnabled =
        pendingArticleRecommendation ?? serverArticleRecommendationEnabled

    const isSaveDisabled =
        pendingOrderManagement === null &&
        pendingArticleRecommendation === null &&
        pendingFlows === null &&
        pendingQuickReplies === null

    const handleSave = async () => {
        const promises: Promise<unknown>[] = []

        if (
            serverSettings &&
            (pendingOrderManagement !== null ||
                pendingArticleRecommendation !== null ||
                pendingFlows !== null)
        ) {
            promises.push(
                handleChatApplicationAutomationSettingsUpdate({
                    ...serverSettings,
                    ...(pendingOrderManagement !== null && {
                        orderManagement: { enabled: pendingOrderManagement },
                    }),
                    ...(pendingArticleRecommendation !== null && {
                        articleRecommendation: {
                            enabled: pendingArticleRecommendation,
                        },
                    }),
                    ...(pendingFlows !== null && {
                        workflows: {
                            ...serverSettings.workflows,
                            entrypoints: pendingFlows,
                        },
                    }),
                }),
            )
        }

        if (pendingQuickReplies !== null) {
            const trimmedReplies = pendingQuickReplies.replies
                .map((r) => r.trim())
                .filter((r) => r.length > 0)

            promises.push(
                dispatch(
                    updateOrCreateIntegration(
                        fromJS({
                            id: gorgiasChatIntegration.id,
                            meta: {
                                ...gorgiasChatIntegration.meta,
                                quick_replies: {
                                    enabled: pendingQuickReplies.enabled,
                                    replies: trimmedReplies,
                                },
                            },
                        }),
                    ),
                ) as unknown as Promise<unknown>,
            )
        }

        await Promise.all(promises)

        setPendingOrderManagement(null)
        setPendingArticleRecommendation(null)
        setPendingFlows(null)
        setPendingQuickReplies(null)
        reloadPreview()
    }

    const handleFlowsCardFocus = useCallback(() => {
        displayPage('homepage')
    }, [displayPage])

    if (!isConnected) {
        return (
            <GorgiasChatRevampLayout integration={integration}>
                <ConnectedChannelsEmptyView
                    view={AutomateFeatures.AutomateChat}
                />
            </GorgiasChatRevampLayout>
        )
    }

    return (
        <>
            <SaveChangesPrompt
                when={!isSaveDisabled}
                onSave={handleSave}
                onDiscard={reloadPreview}
                shouldRedirectAfterSave
            />
            <GorgiasChatRevampLayout
                integration={integration}
                onSave={handleSave}
                isSaveDisabled={isSaveDisabled}
                isSaving={isSaving}
            >
                <div className={css.cardsWrapper}>
                    <FlowsCard
                        isLoading={isFlowsLoading}
                        shopName={shopName}
                        shopType={shopType}
                        channel={channel}
                        primaryLanguage={primaryLanguage}
                        workflowEntrypoints={workflowEntrypoints}
                        workflowConfigurations={workflowConfigurations}
                        automationSettingsWorkflows={
                            pendingFlows ?? automationSettingsWorkflows
                        }
                        onAdd={handleFlowsChange}
                        onRemove={handleFlowsChange}
                        onReorder={handleFlowsChange}
                        onFocus={handleFlowsCardFocus}
                    />
                    {orderManagementEnabledInSettings && (
                        <OrderManagementCard
                            isEnabled={isOrderManagementEnabled}
                            isDisabled={isOrderManagementDisabled}
                            isLoading={isOrderManagementLoading}
                            showStoreRequired={showStoreRequired}
                            orderManagementUrl={orderManagementUrl}
                            onChange={setPendingOrderManagement}
                        />
                    )}
                    {articleRecommendationEnabledInSettings && (
                        <ArticleRecommendationCard
                            isEnabled={isArticleRecommendationEnabled}
                            isDisabled={isArticleRecommendationDisabled}
                            isLoading={isArticleRecommendationLoading}
                            showHelpCenterRequired={showHelpCenterRequired}
                            onChange={setPendingArticleRecommendation}
                        />
                    )}
                    {isQuickRepliesEnabled && (
                        <QuickRepliesCard
                            isEnabled={currentQuickReplies.enabled}
                            replies={currentQuickReplies.replies}
                            onChange={handleQuickRepliesChange}
                        />
                    )}
                </div>
            </GorgiasChatRevampLayout>
        </>
    )
}
