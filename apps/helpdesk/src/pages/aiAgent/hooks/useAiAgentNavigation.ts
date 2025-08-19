import { useMemo } from 'react'

import { LDFlagSet } from 'launchdarkly-js-client-sdk'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    ANALYTICS,
    ANALYZE,
    CHANNELS,
    CHAT,
    CUSTOMER_ENGAGEMENT,
    DEPLOY,
    EMAIL,
    GENERAL,
    GUIDANCE,
    INTENTS,
    KNOWLEDGE,
    OPPORTUNITIES,
    OPTIMIZE,
    OVERVIEW,
    PREVIEW,
    PRODUCT_RECOMMENDATIONS,
    PRODUCTS,
    SALES,
    SETTINGS,
    SOURCES,
    STRATEGY,
    SUPPORT_ACTIONS,
    TEST,
    TRAIN,
} from 'pages/aiAgent/constants'

export const getAiAgentBasePath = (shopName: string) =>
    `/app/ai-agent/shopify/${shopName}`

export const aiAgentRoutes = {
    overview: '/app/ai-agent/overview',
    actionsPlatform: '/app/ai-agent/actions-platform',
}

export const getAiAgentNavigationRoutes = (
    shopName: string,
    flags: LDFlagSet,
) => {
    const basePath = getAiAgentBasePath(shopName)
    const automationBasePath = '/app/automation'
    const isStandaloneOnboardingEnabled =
        flags[FeatureFlagKey.AiShoppingAssistantEnabled]
    const isActionDrivenAiAgentNavigationEnabled =
        flags[FeatureFlagKey.ActionDrivenAiAgentNavigation]

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
        knowledgeSources: `${basePath}/knowledge/sources`,
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
        onboardingWizard: isStandaloneOnboardingEnabled
            ? `${basePath}/onboarding`
            : `${basePath}/new`,
        onboardingWizardStep: (step?: string) => {
            if (isStandaloneOnboardingEnabled) {
                return step
                    ? `${basePath}/onboarding/${step}`
                    : `${basePath}/onboarding`
            }

            return `${basePath}/new`
        },
        previewMode: `${basePath}/settings/preview`,
        optimize: `${basePath}/optimize`,
        optimizeIntent: (intentId: string) =>
            `${basePath}/optimize/${intentId}`,
        intents: `${basePath}/intents`,
        intentsWithId: (intentId: string) => `${basePath}/intents/${intentId}`,
        opportunities: `${basePath}/opportunities`,
        products: `${basePath}/products`,
        productsDetail: (productId: number) =>
            `${basePath}/products/${productId}`,

        // New routes for action-driven navigation
        analyzeOverview: isActionDrivenAiAgentNavigationEnabled
            ? `${basePath}/overview`
            : `${basePath}/overview`,
        analyzeIntents: isActionDrivenAiAgentNavigationEnabled
            ? `${basePath}/intents`
            : `${basePath}/optimize`,
        analyzeOpportunities: `${basePath}/analyze/opportunities`,
        trainAiFeedback: `${basePath}/train/ai-feedback`,
        deployChat: isActionDrivenAiAgentNavigationEnabled
            ? `${basePath}/deploy/chat`
            : `${basePath}/settings/channels`,
        deployEmail: isActionDrivenAiAgentNavigationEnabled
            ? `${basePath}/deploy/email`
            : `${basePath}/settings`,
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
    flags: LDFlagSet,
) => {
    const isGorgiasUser =
        flags[FeatureFlagKey.FollowUpAiAgentPreviewMode] &&
        (window.USER_IMPERSONATED || window.DEVELOPMENT)

    const isAiAgentKnowledgeTabEnabled =
        flags[FeatureFlagKey.AiAgentKnowledgeTab]

    const isAiAgentOptimizeTabEnabled = flags[FeatureFlagKey.AiAgentOptimizeTab]

    const isAiAgentScrapeStoreDomainEnabled =
        flags[FeatureFlagKey.AiAgentScrapeStoreDomain]

    const isAiShoppingAssistantEnabled =
        !!flags[FeatureFlagKey.AiShoppingAssistantEnabled]

    const isAiShoppingAssistantProductRecommendationsEnabled =
        !!flags[FeatureFlagKey.AiShoppingAssistantProductRecommendations]

    const isShoppingAssitantDeactivationEnforced =
        flags[FeatureFlagKey.ShoppingAssistantEnforceDeactivation]

    const isActionDrivenAiAgentNavigationEnabled =
        flags[FeatureFlagKey.ActionDrivenAiAgentNavigation]

    const isOpportunitiesEnabled = flags[FeatureFlagKey.SurfaceOpportunities]

    return useMemo<NavigationItem[]>(() => {
        if (isActionDrivenAiAgentNavigationEnabled) {
            return [
                {
                    title: ANALYZE,
                    dataCanduId: 'ai-agent-navbar-analyze',
                    items: [
                        {
                            route: routes.analyzeOverview,
                            title: OVERVIEW,
                            exact: true,
                        },
                        isAiAgentOptimizeTabEnabled && {
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
                    items: [
                        // TODO: uncomment when overview page is moved to the new navigation
                        /*{
                            route: routes.trainAiFeedback,
                            title: AI_FEEDBACK,
                            exact: true,
                        }, */
                        {
                            route: isAiAgentKnowledgeTabEnabled
                                ? routes.knowledge
                                : routes.guidance,
                            title: KNOWLEDGE,
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
                            route: routes.actions,
                            title: SUPPORT_ACTIONS,
                        },
                        {
                            route: routes.products,
                            title: PRODUCTS,
                            exact: true,
                        },
                        !isShoppingAssitantDeactivationEnforced && {
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
                                      isAiShoppingAssistantEnabled &&
                                          isAiShoppingAssistantProductRecommendationsEnabled && {
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
                },
                {
                    title: DEPLOY,
                    dataCanduId: 'ai-agent-navbar-deploy',
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
                    ],
                },
                {
                    title: SETTINGS,
                    dataCanduId: 'ai-agent-navbar-settings',
                    route: routes.settings,
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
        }

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
            !isShoppingAssitantDeactivationEnforced && {
                route: routes.sales,
                title: SALES,
                dataCanduId: 'ai-agent-navbar-sales',
                items: isAiShoppingAssistantEnabled
                    ? ([
                          isAiShoppingAssistantEnabled && {
                              route: routes.analytics,
                              title: ANALYTICS,
                              exact: true,
                          },
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
                          isAiShoppingAssistantEnabled &&
                              isAiShoppingAssistantProductRecommendationsEnabled && {
                                  route: routes.productRecommendations,
                                  title: PRODUCT_RECOMMENDATIONS,
                                  exact: true,
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
    }, [
        isAiAgentKnowledgeTabEnabled,
        isAiAgentOptimizeTabEnabled,
        isAiAgentScrapeStoreDomainEnabled,
        isGorgiasUser,
        isAiShoppingAssistantEnabled,
        isAiShoppingAssistantProductRecommendationsEnabled,
        isShoppingAssitantDeactivationEnforced,
        isActionDrivenAiAgentNavigationEnabled,
        isOpportunitiesEnabled,
        routes,
    ])
}

export const useAiAgentNavigation = ({ shopName }: { shopName: string }) => {
    const flags = useFlags()

    const routes = useMemo(
        () => getAiAgentNavigationRoutes(shopName, flags),
        [shopName, flags],
    )

    const navigationItems = useNavigationItems(routes, flags)

    return { navigationItems, routes }
}
