import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { IconName } from '@gorgias/axiom'

import {
    ANALYZE,
    CHAT,
    CUSTOMER_ENGAGEMENT,
    DEPLOY,
    EMAIL,
    GENERAL,
    GUIDANCE,
    INTENTS,
    KNOWLEDGE,
    OPPORTUNITIES,
    OVERVIEW,
    PREVIEW,
    PROCEDURES,
    PRODUCT_RECOMMENDATIONS,
    PRODUCTS,
    SALES,
    SETTINGS,
    SOURCES,
    STRATEGY,
    SUPPORT_ACTIONS,
    TEST,
    TONE_OF_VOICE,
    TRAIN,
} from 'pages/aiAgent/constants'

export const getAiAgentBasePath = (shopName: string) =>
    `/app/ai-agent/shopify/${shopName}`

export const aiAgentRoutes = {
    overview: '/app/ai-agent/overview',
    actionsPlatform: '/app/ai-agent/actions-platform',
}

export const getAiAgentNavigationRoutes = (shopName: string) => {
    const basePath = getAiAgentBasePath(shopName)
    const automationBasePath = '/app/automation'

    const guidancePath = 'knowledge/guidance'

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
        perShopOverview: `${basePath}/overview`,
        settings: `${basePath}/settings`,
        test: `${basePath}/test`,
        knowledge: `${basePath}/knowledge`,
        toneOfVoice: `${basePath}/tone-of-voice`,
        knowledgeArticle: (type: string, id: number) =>
            `${basePath}/knowledge/${type}/${id}`,
        knowledgeSources: `${basePath}/knowledge/sources`,
        knowledgeSourcesByDomain: (domain: string) =>
            `${basePath}/knowledge/sources?filter=domain&folder=${encodeURIComponent(domain)}`,
        sales: `${basePath}/sales`,
        salesStrategy: `${basePath}/sales/strategy`,
        customerEngagement: `${basePath}/sales/customer-engagement`,
        productRecommendations: `${basePath}/sales/product-recommendations`,
        productRecommendationsExclude: `${basePath}/sales/product-recommendations/exclude`,
        productRecommendationsPromote: `${basePath}/sales/product-recommendations/promote`,
        analytics: `${basePath}/sales/analytics`,
        questionsContent: `${basePath}/knowledge/sources/questions-content`,
        productsContent: `${basePath}/knowledge/sources/products-content`,
        questionsContentDetail: (articleId: number) =>
            `${basePath}/knowledge/sources/questions-content/${articleId}`,
        productsContentDetail: (productId: number) =>
            `${basePath}/knowledge/sources/products-content/${productId}`,
        urlArticles: (articleIngestionId: number) =>
            `${basePath}/knowledge/sources/url-articles/${articleIngestionId}/articles`,
        urlArticlesDetail: (articleIngestionId: number, articleId: number) =>
            `${basePath}/knowledge/sources/url-articles/${articleIngestionId}/articles/${articleId}`,
        fileArticles: (fileIngestionId: number) =>
            `${basePath}/knowledge/sources/file-articles/${fileIngestionId}/articles`,
        fileArticlesDetail: (fileIngestionId: number, articleId: number) =>
            `${basePath}/knowledge/sources/file-articles/${fileIngestionId}/articles/${articleId}`,

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
        settingsChannels: `${basePath}/settings/channels`,
        actions: `${basePath}/actions`,
        newAction: (templateId?: string) =>
            `${basePath}/actions/new${templateId ? `?template_id=${templateId}` : ''}`,
        editAction: (configurationId: string) =>
            `${basePath}/actions/edit/${configurationId}`,
        actionsTemplates: `${basePath}/actions/templates`,
        actionEvents: (configurationId: string) =>
            `${basePath}/actions/events/${configurationId}`,
        onboardingWizard: `${basePath}/onboarding`,
        onboardingWizardStep: (step?: string) =>
            step ? `${basePath}/onboarding/${step}` : `${basePath}/onboarding`,
        previewMode: `${basePath}/settings/preview`,
        optimize: `${basePath}/optimize`,
        optimizeIntent: (intentId: string) =>
            `${basePath}/optimize/${intentId}`,
        intents: `${basePath}/intents`,
        intentsWithId: (intentId: string) => `${basePath}/intents/${intentId}`,
        opportunities: `${basePath}/opportunities`,
        opportunitiesWithId: (opportunityId?: string) =>
            opportunityId
                ? `${basePath}/opportunities/${opportunityId}`
                : `${basePath}/opportunities`,
        procedures: `${basePath}/procedures`,
        products: `${basePath}/products`,
        productsDetail: (productId: number) =>
            `${basePath}/products/${productId}`,

        // New routes for action-driven navigation
        analyzeOverview: `${basePath}/overview`,
        analyzeIntents: `${basePath}/intents`,
        analyzeOpportunities: `${basePath}/analyze/opportunities`,
        trainAiFeedback: `${basePath}/train/ai-feedback`,
        deployChat: `${basePath}/deploy/chat`,
        deployEmail: `${basePath}/deploy/email`,
        deploySms: `${basePath}/deploy/sms`,
    }
}

export type NavigationItem = {
    route: string
    title: string
    exact?: boolean
    dataCanduId?: string
    icon?: IconName
    items?: NavigationItem[]
}

const useNavigationItems = (
    routes: ReturnType<typeof getAiAgentNavigationRoutes>,
) => {
    const isGorgiasUser =
        useFlag(FeatureFlagKey.FollowUpAiAgentPreviewMode) &&
        (window.USER_IMPERSONATED || window.DEVELOPMENT)

    const isAiAgentScrapeStoreDomainEnabled = useFlag(
        FeatureFlagKey.AiAgentScrapeStoreDomain,
    )

    const isAiShoppingAssistantEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantEnabled,
    )

    const isShoppingAssistantDeactivationEnforced = useFlag(
        FeatureFlagKey.ShoppingAssistantEnforceDeactivation,
    )

    const isAbTestingEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantAbTesting,
        false,
    )

    const isSmsChannelEnabled = useFlag(FeatureFlagKey.AiAgentSmsChannel)

    const isOpportunitiesEnabled = useFlag(
        FeatureFlagKey.OpportunitiesMilestone2,
    )

    const isKnowledgeIntentManagementSystemEnabled = useFlag(
        FeatureFlagKey.KnowledgeIntentManagementSystem,
    )

    const shouldRenderShoppingAssistantPages =
        !isShoppingAssistantDeactivationEnforced ||
        (isShoppingAssistantDeactivationEnforced && isAbTestingEnabled)

    const shouldRenderToneOfVoice = useFlag(FeatureFlagKey.AiAgentToneOfVoice)
    // Actions platform is rendered outside the per-shop navigation in the
    // ActionDrivenNavigation component.

    return useMemo<NavigationItem[]>(() => {
        return [
            {
                title: ANALYZE,
                dataCanduId: 'ai-agent-navbar-analyze',
                icon: 'chart-line',
                items: [
                    {
                        route: routes.analyzeOverview,
                        title: OVERVIEW,
                        exact: true,
                    },
                    {
                        route: routes.analyzeIntents,
                        title: INTENTS,
                        exact: false,
                    },
                    isOpportunitiesEnabled && {
                        route: routes.opportunities,
                        title: OPPORTUNITIES,
                        dataCanduId: 'ai-agent-navbar-opportunities',
                        exact: false,
                    },
                ].filter((x) => !!x) as NavigationItem[],
            },
            {
                title: TRAIN,
                dataCanduId: 'ai-agent-navbar-train',
                icon: 'graduated',
                items: [
                    // TODO: uncomment when overview page is moved to the new navigation
                    /*{
                            route: routes.trainAiFeedback,
                            title: AI_FEEDBACK,
                            exact: true,
                        }, */
                    isKnowledgeIntentManagementSystemEnabled && {
                        route: routes.procedures,
                        title: PROCEDURES,
                        dataCanduId: 'ai-agent-navbar-procedures',
                        exact: true,
                    },
                    {
                        route: routes.knowledge,
                        title: KNOWLEDGE,
                        items: [
                            {
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
                        ],
                    },
                    shouldRenderToneOfVoice && {
                        route: routes.toneOfVoice,
                        title: TONE_OF_VOICE,
                    },
                    {
                        route: routes.actions,
                        title: SUPPORT_ACTIONS,
                    },
                    {
                        route: routes.products,
                        title: PRODUCTS,
                        exact: true,
                    },
                    shouldRenderShoppingAssistantPages && {
                        route: routes.sales,
                        title: SALES,
                        items: isAiShoppingAssistantEnabled
                            ? ([
                                  isAiShoppingAssistantEnabled && {
                                      route: routes.salesStrategy,
                                      title: STRATEGY,
                                      exact: true,
                                  },
                                  isAiShoppingAssistantEnabled && {
                                      route: routes.customerEngagement,
                                      title: CUSTOMER_ENGAGEMENT,
                                      exact: true,
                                  },
                                  isAiShoppingAssistantEnabled && {
                                      route: routes.productRecommendations,
                                      title: PRODUCT_RECOMMENDATIONS,
                                      exact: true,
                                  },
                              ].filter((x) => !!x) as NavigationItem[])
                            : undefined,
                    },
                ].filter((x) => !!x) as NavigationItem[],
            },
            {
                route: routes.test,
                title: TEST,
                dataCanduId: 'ai-agent-navbar-test',
                exact: true,
                icon: 'media-play-circle',
            },
            {
                title: DEPLOY,
                dataCanduId: 'ai-agent-navbar-deploy',
                icon: 'rocket',
                items: [
                    {
                        route: routes.deployChat,
                        title: CHAT,
                        exact: true,
                    },
                    {
                        route: routes.deployEmail,
                        title: EMAIL,
                        exact: true,
                    },
                    isSmsChannelEnabled && {
                        route: routes.deploySms,
                        title: 'SMS',
                        exact: true,
                    },
                ].filter((x) => !!x) as NavigationItem[],
            },
            {
                title: SETTINGS,
                dataCanduId: 'ai-agent-navbar-settings',
                route: routes.settings,
                icon: 'slider-filter',
                items: isGorgiasUser
                    ? [
                          {
                              route: routes.configuration(),
                              title: GENERAL,
                              exact: true,
                          },
                          {
                              route: routes.previewMode,
                              title: PREVIEW,
                          },
                      ]
                    : undefined,
            },
        ].filter((x) => !!x) as NavigationItem[]
    }, [
        isAiAgentScrapeStoreDomainEnabled,
        isGorgiasUser,
        isAiShoppingAssistantEnabled,
        isSmsChannelEnabled,
        shouldRenderShoppingAssistantPages,
        shouldRenderToneOfVoice,
        isOpportunitiesEnabled,
        isKnowledgeIntentManagementSystemEnabled,
        routes,
    ])
}

export const useAiAgentNavigation = ({ shopName }: { shopName: string }) => {
    const routes = useMemo(
        () => getAiAgentNavigationRoutes(shopName),
        [shopName],
    )

    const navigationItems = useNavigationItems(routes)

    return { navigationItems, routes }
}
