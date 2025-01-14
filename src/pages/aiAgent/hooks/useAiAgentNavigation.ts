import {LDFlagSet} from 'launchdarkly-js-client-sdk'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import useShowAutomateActions from 'pages/aiAgent/actions/hooks/useShowAutomateActions'
import {
    ACTIONS,
    GENERAL,
    GUIDANCE,
    KNOWLEDGE,
    OPTIMIZE,
    PREVIEW,
    SETTINGS,
    TEST,
} from 'pages/aiAgent/constants'

const getAiAgentBasePath = (shopName: string, flags: LDFlagSet) => {
    const isStandaloneMenuEnabled = flags[FeatureFlagKey.ConvAiStandaloneMenu]
    return isStandaloneMenuEnabled
        ? `/app/ai-agent/shopify/${shopName}`
        : `/app/automation/shopify/${shopName}/ai-agent`
}

/** Retrieve AI Agent routes depending on the conv-ai-standalone-menu feature flag */
export const getAiAgentNavigationRoutes = (
    shopName: string,
    flags: LDFlagSet
) => {
    const basePath = getAiAgentBasePath(shopName, flags)
    return {
        automation: `/app/automation`,
        main: basePath,
        settings: `${basePath}/settings`,
        test: `${basePath}/test`,
        guidance: `${basePath}/guidance`,
        knowledge: `${basePath}/knowledge`,
        knowledgeGuidance: `${basePath}/knowledge/guidance`,
        knowledgeActions: `${basePath}/knowledge/actions`,
        newGuidanceArticle: `${basePath}/guidance/new`,
        configuration: (section?: 'knowledge' | 'email') =>
            `${basePath}/settings${section ? `?section=${section}` : ''}`,
        settingsChannels: `${basePath}/settings/channels`,
        guidanceArticleEdit: (articleId: number) =>
            `${basePath}/guidance/${articleId}`,
        guidanceTemplates: `${basePath}/guidance/templates`,
        guidanceLibrary: `${basePath}/guidance/library`,
        newGuidanceTemplateArticle: (templateId: string) =>
            `${basePath}/guidance/templates/${templateId}`,
        newGuidanceAiSuggestionArticle: (aiGuidanceId: string) =>
            `${basePath}/guidance/library/${aiGuidanceId}`,
        actions: `${basePath}/actions`,
        newAction: (templateId?: string) =>
            `${basePath}/actions/new${templateId ? `?template_id=${templateId}` : ''}`,
        editAction: (configurationId: string) =>
            `${basePath}/actions/edit/${configurationId}`,
        actionsTemplates: `${basePath}/actions/templates`,
        actionEvents: (configurationId: string) =>
            `${basePath}/actions/events/${configurationId}`,
        onboardingWizard: `${basePath}/new`,
        previewMode: `${basePath}/preview-mode`,
        optimize: `${basePath}/optimize`,
        optimizeIntent: (intentId: string) =>
            `${basePath}/optimize/${intentId}`,
    }
}

type NavigationItem = {
    route: string
    title: string
    exact?: boolean
    dataCanduId?: string
    items?: NavigationItem[]
}

const useNavigationItems = (
    routes: ReturnType<typeof getAiAgentNavigationRoutes>
) => {
    const showAutomateActions = useShowAutomateActions()
    const flags = useFlags()

    const isGorgiasUser =
        flags[FeatureFlagKey.FollowUpAiAgentPreviewMode] &&
        (window.USER_IMPERSONATED || window.DEVELOPMENT)

    const isAiAgentKnowledgeTabEnabled =
        flags[FeatureFlagKey.AiAgentKnowledgeTab]

    const isAiAgentOptimizeTabEnabled = flags[FeatureFlagKey.AiAgentOptimizeTab]

    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    return useMemo<NavigationItem[]>(() => {
        if (isStandaloneMenuEnabled) {
            return [
                isAiAgentOptimizeTabEnabled && {
                    route: routes.optimize,
                    title: OPTIMIZE,
                    exact: false,
                },
                isAiAgentKnowledgeTabEnabled && {
                    route: routes.knowledge,
                    title: KNOWLEDGE,
                    dataCanduId: 'ai-agent-navbar-knowledge',
                    items: [
                        {
                            route: routes.knowledge,
                            title: GENERAL,
                            exact: true,
                        },
                        //   {
                        //       route: routes.knowledgeGuidance,
                        //       title: GUIDANCE,
                        //   },
                        //   {
                        //       route: routes.knowledgeActions,
                        //       title: ACTIONS,
                        //   },
                    ],
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
                        // {
                        //     route: routes.settingsChannels,
                        //     title: CHANNELS,
                        // },
                    ],
                },
                // TODO: Add "Sales" tab here
                {
                    route: routes.test,
                    title: TEST,
                },
                isGorgiasUser && {
                    route: routes.previewMode,
                    title: PREVIEW,
                },
            ].filter((x) => !!x) as NavigationItem[]
        }

        return [
            isAiAgentOptimizeTabEnabled && {
                route: routes.optimize,
                title: OPTIMIZE,
                exact: false,
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
                exact: false,
            },
            showAutomateActions && {
                route: routes.actions,
                title: ACTIONS,
                exact: false,
                dataCanduId: 'ai-agent-navbar-actions',
            },
            {
                route: routes.test,
                title: TEST,
            },
            isGorgiasUser && {
                route: routes.previewMode,
                title: PREVIEW,
            },
        ].filter((x) => !!x) as NavigationItem[]
    }, [
        isStandaloneMenuEnabled,
        isAiAgentKnowledgeTabEnabled,
        isAiAgentOptimizeTabEnabled,
        isGorgiasUser,
        routes,
        showAutomateActions,
    ])
}

export const useAiAgentNavigation = ({shopName}: {shopName: string}) => {
    const flags = useFlags()

    const routes = useMemo(
        () => getAiAgentNavigationRoutes(shopName, flags),
        [shopName, flags]
    )

    const navigationItems = useNavigationItems(routes)

    return {navigationItems, routes}
}
