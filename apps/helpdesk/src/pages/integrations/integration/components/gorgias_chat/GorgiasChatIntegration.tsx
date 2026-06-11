import { useEffect, useMemo, useRef } from 'react'

import { history } from '@repo/routing'
import type { List, Map } from 'immutable'
import { useParams } from 'react-router-dom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import type { LanguageItem } from 'config/integrations/gorgias_chat'
import type { LANGUAGE } from 'constants/languages'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { IntegrationType } from 'models/integration/types'
import { useApplicationsAutomationSettings } from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import {
    ChatPreviewPanelContext,
    useChatPreviewPanel,
} from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { useChatRedesignOptIn } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useChatRedesignOptIn'
import { useLogMigrationEvent } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useLogMigrationEvent'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'
import type * as IntegrationsActions from 'state/integrations/actions'

import { Tab } from '../../types'
import { GorgiasAutomateChatIntegration } from './GorgiasAutomateChatIntegration'
import { GorgiasChatCreationWizard } from './GorgiasChatCreationWizard'
import { GorgiasChatIntegrationAppearance } from './GorgiasChatIntegrationAppearance'
import { GorgiasChatIntegrationInstall } from './GorgiasChatIntegrationInstall'
import { GorgiasChatIntegrationLanguages } from './GorgiasChatIntegrationLanguages'
import { GorgiasChatIntegrationList } from './GorgiasChatIntegrationList'
import { GorgiasChatIntegrationPreferences } from './GorgiasChatIntegrationPreferences'
import { GorgiasChatTranslateText } from './GorgiasChatTranslateText'
import { GorgiasChatIntegrationCampaignsComponent as GorgiasChatIntegrationCampaignsLegacy } from './legacy/GorgiasChatIntegrationCampaigns/GorgiasChatIntegrationCampaigns'
import { GorgiasChatIntegrationQuickRepliesWithHook as GorgiasChatIntegrationQuickRepliesLegacy } from './legacy/GorgiasChatIntegrationQuickReplies/GorgiasChatIntegrationQuickReplies'
import { useIsQuickRepliesEnabled } from './legacy/GorgiasChatIntegrationQuickReplies/hooks/useIsQuickRepliesEnabled'
import { useSelfServiceConfiguration } from './legacy/hooks/useSelfServiceConfiguration'

type Props = {
    actions: typeof IntegrationsActions
    currentUser: Map<any, any>
    integration: Map<any, any>
    integrationsProp: List<Map<any, any>>
    loading: Map<any, any>
    isUpdate: boolean
}

export const GorgiasChatIntegration = ({
    actions,
    currentUser,
    integration,
    integrationsProp,
    loading,
    isUpdate,
}: Props) => {
    const { extra, integrationId, subId } = useParams<{
        extra: string | undefined
        integrationId: string
        integrationType: IntegrationType
        subId: string
    }>()

    const chatLanguage = useMemo(() => {
        const primaryLanguage: LANGUAGE | undefined = integration
            .getIn(['meta', 'languages'])
            ?.find(
                (
                    lang: Map<
                        keyof LanguageItem,
                        LanguageItem[keyof LanguageItem]
                    >,
                ) => {
                    return lang.get('primary') === true
                },
            )
            .get('language')

        return primaryLanguage
    }, [integration])

    const { storeIntegration } = useStoreIntegration(integration)

    const {
        shouldShowChatSettingsRevamp,
        shouldShowNonAiAgentChatSettingsRevamp,
        isLoading: isChatSettingsRevampLoading,
    } = useShouldShowChatSettingsRevamp(storeIntegration, integration.get('id'))

    const { isOptedIn } = useChatRedesignOptIn(integration.get('id'))

    const { logBannerViewed } = useLogMigrationEvent()

    // Logged here (above the tabs) rather than from the banner itself, which
    // re-mounts on every tab change. The ref keeps it to one event per visit
    // to the chat settings page while the migration banner is visible.
    const hasLoggedBannerViewRef = useRef(false)
    useEffect(() => {
        if (
            shouldShowNonAiAgentChatSettingsRevamp &&
            !isOptedIn &&
            !hasLoggedBannerViewRef.current
        ) {
            hasLoggedBannerViewRef.current = true
            logBannerViewed()
        }
    }, [shouldShowNonAiAgentChatSettingsRevamp, isOptedIn, logBannerViewed])

    const {
        showPreviewPanel,
        hidePreviewPanel,
        chatPreviewPortal,
        ...charPreviewPanelControls
    } = useChatPreviewPanel({
        locale: chatLanguage,
        showBusinessHoursToggle: shouldShowNonAiAgentChatSettingsRevamp,
        forceChatRedesign:
            shouldShowNonAiAgentChatSettingsRevamp &&
            !isChatSettingsRevampLoading &&
            isOptedIn,
    })
    const isQuickRepliesEnabled = useIsQuickRepliesEnabled()
    const { hasAccess } = useAiAgentAccess()

    const editLinkDefaultTab = useMemo(() => {
        return `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}/${Tab.Appearance}`
    }, [integrationId])

    const goToDefaultTab = () => history.replace(editLinkDefaultTab)
    if (!extra && integrationId) {
        goToDefaultTab()
    }
    const chatApplicationIds = useMemo(() => {
        const appId: string = integration.getIn(['meta', 'app_id'])
        if (appId) {
            return [appId]
        }
        return []
    }, [integration])

    const { applicationsAutomationSettings } =
        useApplicationsAutomationSettings(chatApplicationIds)

    const { selfServiceConfiguration, selfServiceConfigurationEnabled } =
        useSelfServiceConfiguration(integration)

    const articleRecommendationEnabled = useMemo(() => {
        const appId = chatApplicationIds[0]
        return appId
            ? Boolean(
                  applicationsAutomationSettings[appId]?.articleRecommendation
                      ?.enabled && hasAccess,
              )
            : false
    }, [hasAccess, chatApplicationIds, applicationsAutomationSettings])

    useEffect(() => {
        if (shouldShowChatSettingsRevamp) {
            if (
                !extra ||
                extra === Tab.Languages ||
                extra === Tab.Installation
            ) {
                hidePreviewPanel()
            } else {
                showPreviewPanel(integration.getIn(['meta', 'app_id']) || null)
            }
        }

        return () => {
            hidePreviewPanel()
        }
    }, [
        integration,
        showPreviewPanel,
        hidePreviewPanel,
        shouldShowChatSettingsRevamp,
        extra,
    ])

    const content = useMemo(() => {
        if (!integrationId) {
            return (
                <GorgiasChatIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                />
            )
        }

        if (extra === Tab.CreateWizard) {
            return (
                <ErrorBoundary
                    sentryTags={{
                        section: 'chat-wizard',
                        team: SentryTeam.ACTIONS_AND_CHANNELS,
                    }}
                >
                    <GorgiasChatCreationWizard
                        isUpdate={isUpdate}
                        loading={loading}
                        integration={integration}
                    />
                </ErrorBoundary>
            )
        }

        if (extra === Tab.Installation) {
            return (
                <GorgiasChatIntegrationInstall
                    actions={actions}
                    integration={integration}
                    isUpdate={isUpdate}
                />
            )
        }

        if (extra === Tab.Preferences) {
            return (
                <GorgiasChatIntegrationPreferences
                    currentUser={currentUser}
                    integration={integration}
                    articleRecommendationEnabled={articleRecommendationEnabled}
                    actions={actions}
                    selfServiceConfiguration={selfServiceConfiguration}
                    selfServiceConfigurationEnabled={
                        selfServiceConfigurationEnabled
                    }
                />
            )
        }

        if (extra === Tab.QuickReplies && isQuickRepliesEnabled) {
            return (
                <GorgiasChatIntegrationQuickRepliesLegacy
                    integration={integration}
                />
            )
        }

        if (extra === Tab.Campaigns) {
            return (
                <GorgiasChatIntegrationCampaignsLegacy
                    integration={integration}
                />
            )
        }

        if (extra === Tab.Appearance || !extra) {
            if (subId) {
                return <GorgiasChatTranslateText integration={integration} />
            }

            return (
                <GorgiasChatIntegrationAppearance
                    actions={actions}
                    integration={integration}
                    isUpdate={isUpdate}
                    loading={loading}
                    currentUser={currentUser}
                />
            )
        }

        if (extra === Tab.Languages) {
            if (subId) {
                return <GorgiasChatTranslateText integration={integration} />
            }

            return (
                <GorgiasChatIntegrationLanguages
                    integration={integration}
                    loading={loading}
                />
            )
        }

        if (extra === Tab.Automate) {
            return <GorgiasAutomateChatIntegration integration={integration} />
        }

        return (
            <GorgiasChatIntegrationList
                integrations={integrationsProp}
                loading={loading}
            />
        )
    }, [
        integrationId,
        extra,
        subId,
        isQuickRepliesEnabled,
        integration,
        integrationsProp,
        loading,
        actions,
        currentUser,
        isUpdate,
        articleRecommendationEnabled,
        selfServiceConfiguration,
        selfServiceConfigurationEnabled,
    ])

    return (
        <ChatPreviewPanelContext.Provider value={charPreviewPanelControls}>
            {content}
            {chatPreviewPortal}
        </ChatPreviewPanelContext.Provider>
    )
}
