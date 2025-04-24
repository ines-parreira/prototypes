import { useMemo } from 'react'

import { LDFlagSet } from 'launchdarkly-js-client-sdk'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    ACTIONS,
    ANALYTICS,
    CHANNELS,
    GENERAL,
    GUIDANCE,
    KNOWLEDGE,
    OPTIMIZE,
    PREVIEW,
    SALES,
    SETTINGS,
    SOURCES,
    STRATEGY,
    SUPPORT_ACTIONS,
    TEST,
    VOLUME,
} from 'pages/aiAgent/constants'

export const getAiAgentBasePath = (shopName: string, flags: LDFlagSet) => {
    const isStandaloneMenuEnabled = flags[FeatureFlagKey.ConvAiStandaloneMenu]
    return isStandaloneMenuEnabled
        ? `/app/ai-agent/shopify/${shopName}`
        : `/app/automation/shopify/${shopName}/ai-agent`
}

export const aiAgentRoutes = {
    overview: '/app/ai-agent/overview',
    actionsPlatform: '/app/ai-agent/actions-platform',
}

/** Retrieve AI Agent routes depending on the conv-ai-standalone-menu feature flag */
export const getAiAgentNavigationRoutes = (
    shopName: string,
    flags: LDFlagSet,
) => {
    const basePath = getAiAgentBasePath(shopName, flags)
    const automationBasePath = '/app/automation'
    const isStandaloneMenuEnabled = flags[FeatureFlagKey.ConvAiStandaloneMenu]
    const isStandaloneOnboardingEnabled = flags[FeatureFlagKey.ConvAiOnboarding]

    const guidancePath = isStandaloneMenuEnabled
        ? 'knowledge/guidance'
        : 'guidance'

    const previewPath = isStandaloneMenuEnabled
        ? 'settings/preview'
        : 'preview-mode'

    const settingsChannelsPath = isStandaloneMenuEnabled
        ? 'settings/channels'
        : 'settings'

    return {
        // Automation routes
        automation: `${automationBasePath}`,
        automationOrderManagement: `${automationBasePath}/shopify/${shopName}/order-management`,
        automationFlows: `${automationBasePath}/shopify/${shopName}/flows`,

        // AI Agent global routes
        overview: aiAgentRoutes.overview,
        actionsPlatform: aiAgentRoutes.actionsPlatform,

        // AI Agent routes
        main: basePath,
        settings: `${basePath}/settings`,
        test: `${basePath}/test`,
        knowledge: `${basePath}/knowledge`,
        knowledgeSources: `${basePath}/knowledge/sources`,
        sales: `${basePath}/sales`,
        volume: `${basePath}/sales/volume`,
        analytics: `${basePath}/sales/analytics`,
        pagesContent: `${basePath}/knowledge/sources/pages-content`,
        productsContent: `${basePath}/knowledge/sources/products-content`,
        guidance: `${basePath}/${guidancePath}`,
        newGuidanceArticle: `${basePath}/${guidancePath}/new`,
        guidanceArticleEdit: (articleId: number) =>
            `${basePath}/${guidancePath}/${articleId}`,
        guidanceTemplates: `${basePath}/${guidancePath}/templates`,
        guidanceLibrary: `${basePath}/${guidancePath}/library`,
        newGuidanceTemplateArticle: (templateId: string) =>
            `${basePath}/${guidancePath}/templates/${templateId}`,
        newGuidanceAiSuggestionArticle: (aiGuidanceId: string) =>
            `${basePath}/${guidancePath}/library/${aiGuidanceId}`,
        configuration: (section?: 'knowledge' | 'email') =>
            `${basePath}/settings${section ? `?section=${section}` : ''}`,
        settingsChannels: `${basePath}/${settingsChannelsPath}`,
        actions: `${basePath}/actions`,
        newAction: (templateId?: string) =>
            `${basePath}/actions/new${templateId ? `?template_id=${templateId}` : ''}`,
        editAction: (configurationId: string) =>
            `${basePath}/actions/edit/${configurationId}`,
        actionsTemplates: `${basePath}/actions/templates`,
        actionEvents: (configurationId: string) =>
            `${basePath}/actions/events/${configurationId}`,
        onboardingWizard:
            isStandaloneMenuEnabled && isStandaloneOnboardingEnabled
                ? `${basePath}/onboarding`
                : `${basePath}/new`,
        onboardingWizardStep: (step?: string) => {
            if (isStandaloneMenuEnabled && isStandaloneOnboardingEnabled) {
                return step
                    ? `${basePath}/onboarding/${step}`
                    : `${basePath}/onboarding`
            }

            return `${basePath}/new`
        },
        previewMode: `${basePath}/${previewPath}`,
        optimize: `${basePath}/optimize`,
        optimizeIntent: (intentId: string) =>
            `${basePath}/optimize/${intentId}`,
    }
}

export type NavigationItem = {
    route: string
    title: string
    exact?: boolean
    dataCanduId?: string
    items?: NavigationItem[]
}

const useNavigationItems = (
    routes: ReturnType<typeof getAiAgentNavigationRoutes>,
) => {
    const flags = useFlags()

    const isGorgiasUser =
        flags[FeatureFlagKey.FollowUpAiAgentPreviewMode] &&
        (window.USER_IMPERSONATED || window.DEVELOPMENT)

    const isAiAgentKnowledgeTabEnabled =
        flags[FeatureFlagKey.AiAgentKnowledgeTab]

    const isAiAgentOptimizeTabEnabled = flags[FeatureFlagKey.AiAgentOptimizeTab]

    const isAiAgentScrapeStoreDomainEnabled =
        flags[FeatureFlagKey.AiAgentScrapeStoreDomain]

    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    const isConversationStartersEnabled =
        !!flags[FeatureFlagKey.ConversationStarters]

    const isSalesMetricsEnabled =
        !!flags[FeatureFlagKey.StandaloneAIAgentSalesMetrics]

    return useMemo<NavigationItem[]>(() => {
        if (isStandaloneMenuEnabled) {
            return [
                isAiAgentOptimizeTabEnabled && {
                    route: routes.optimize,
                    title: OPTIMIZE,
                    dataCanduId: 'ai-agent-navbar-optimize',
                    exact: false,
                },
                {
                    route: isAiAgentKnowledgeTabEnabled
                        ? routes.knowledge
                        : routes.guidance,
                    title: KNOWLEDGE,
                    dataCanduId: 'ai-agent-navbar-knowledge',
                    items: [
                        isAiAgentKnowledgeTabEnabled && {
                            route: isAiAgentScrapeStoreDomainEnabled
                                ? routes.knowledgeSources
                                : routes.knowledge,
                            title: isAiAgentScrapeStoreDomainEnabled
                                ? SOURCES
                                : GENERAL,
                            exact: !isAiAgentScrapeStoreDomainEnabled,
                        },
                        {
                            route: routes.guidance,
                            title: GUIDANCE,
                        },
                    ].filter((x) => !!x) as NavigationItem[],
                },
                {
                    route: routes.configuration(),
                    title: SETTINGS,
                    dataCanduId: 'ai-agent-navbar-configuration',
                    items: [
                        {
                            route: routes.configuration(),
                            title: GENERAL,
                            exact: true,
                        },
                        {
                            route: routes.settingsChannels,
                            title: CHANNELS,
                        },
                        isGorgiasUser && {
                            route: routes.previewMode,
                            title: PREVIEW,
                        },
                    ].filter((x) => !!x) as NavigationItem[],
                },
                {
                    route: routes.actions,
                    title: SUPPORT_ACTIONS,
                    dataCanduId: 'ai-agent-navbar-support-actions',
                },
                {
                    route: routes.sales,
                    title: SALES,
                    dataCanduId: 'ai-agent-navbar-sales',
                    items:
                        isSalesMetricsEnabled || isConversationStartersEnabled
                            ? ([
                                  (isSalesMetricsEnabled ||
                                      isConversationStartersEnabled) && {
                                      route: routes.sales,
                                      title: STRATEGY,
                                      exact: true,
                                  },
                                  isConversationStartersEnabled && {
                                      route: routes.volume,
                                      title: VOLUME,
                                  },
                                  isSalesMetricsEnabled && {
                                      route: routes.analytics,
                                      title: ANALYTICS,
                                  },
                              ].filter((x) => !!x) as NavigationItem[])
                            : undefined,
                },
                {
                    route: routes.test,
                    dataCanduId: 'ai-agent-navbar-test',
                    title: TEST,
                },
            ].filter((x) => !!x) as NavigationItem[]
        }

        return [
            isAiAgentOptimizeTabEnabled && {
                route: routes.optimize,
                title: OPTIMIZE,
                exact: false,
                dataCanduId: 'ai-agent-navbar-optimize',
            },
            {
                route: routes.configuration(),
                title: SETTINGS,
                dataCanduId: 'ai-agent-navbar-configuration',
            },
            isAiAgentKnowledgeTabEnabled && {
                route: routes.knowledge,
                title: KNOWLEDGE,
                dataCanduId: 'ai-agent-navbar-knowledge',
            },
            {
                route: routes.guidance,
                title: GUIDANCE,
                dataCanduId: 'ai-agent-navbar-guidance',
                exact: false,
            },
            {
                route: routes.actions,
                title: ACTIONS,
                exact: false,
                dataCanduId: 'ai-agent-navbar-actions',
            },
            {
                route: routes.sales,
                title: SALES,
                dataCanduId: 'ai-agent-navbar-sales',
            },
            {
                route: routes.test,
                title: TEST,
                dataCanduId: 'ai-agent-navbar-test',
            },
            isGorgiasUser && {
                route: routes.previewMode,
                title: PREVIEW,
                dataCanduId: 'ai-agent-navbar-preview',
            },
        ].filter((x) => !!x) as NavigationItem[]
    }, [
        isAiAgentKnowledgeTabEnabled,
        isAiAgentOptimizeTabEnabled,
        isConversationStartersEnabled,
        isAiAgentScrapeStoreDomainEnabled,
        isSalesMetricsEnabled,
        isGorgiasUser,
        isStandaloneMenuEnabled,
        routes,
    ])
}

export const useAiAgentNavigation = ({ shopName }: { shopName: string }) => {
    const flags = useFlags()

    const routes = useMemo(
        () => getAiAgentNavigationRoutes(shopName, flags),
        [shopName, flags],
    )

    const navigationItems = useNavigationItems(routes)

    return { navigationItems, routes }
}
