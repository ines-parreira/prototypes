import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import useShowAutomateActions from 'pages/aiAgent/actions/hooks/useShowAutomateActions'
import {
    ACTIONS,
    GUIDANCE,
    KNOWLEDGE,
    OPTIMIZE,
    PREVIEW,
    SETTINGS,
    TEST,
} from 'pages/aiAgent/constants'

export const useAiAgentNavigation = ({shopName}: {shopName: string}) => {
    const showAutomateActions = useShowAutomateActions()
    const isGorgiasUser =
        useFlags()[FeatureFlagKey.FollowUpAiAgentPreviewMode] &&
        (window.USER_IMPERSONATED || window.DEVELOPMENT)

    const isAiAgentKnowledgeTabEnabled =
        useFlags()[FeatureFlagKey.AiAgentKnowledgeTab]

    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    const isAiAgentOptimizeTabEnabled =
        useFlags()[FeatureFlagKey.AiAgentOptimizeTab]

    const basePath = isStandaloneMenuEnabled
        ? `/app/ai-agent/shopify/${shopName}`
        : `/app/automation/shopify/${shopName}/ai-agent`

    const routes = useMemo(
        () => ({
            automation: `/app/automation`,
            main: basePath,
            test: `${basePath}/test`,
            guidance: `${basePath}/guidance`,
            knowledge: `${basePath}/knowledge`,
            newGuidanceArticle: `${basePath}/guidance/new`,
            configuration: (section?: 'knowledge' | 'email') =>
                `${basePath}/settings${section ? `?section=${section}` : ''}`,
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
                `${basePath}/actions/new${
                    templateId ? `?template_id=${templateId}` : ''
                }`,
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
        }),
        [basePath]
    )

    const headerNavbarItems = useMemo(
        () => [
            ...(isAiAgentOptimizeTabEnabled
                ? [
                      {
                          route: routes.optimize,
                          title: OPTIMIZE,
                          exact: false,
                      },
                  ]
                : []),
            {
                route: routes.configuration(),
                title: SETTINGS,
                dataCanduId: 'ai-agent-navbar-configuration',
            },
            ...(isAiAgentKnowledgeTabEnabled
                ? [
                      {
                          route: routes.knowledge,
                          title: KNOWLEDGE,
                          dataCanduId: 'ai-agent-navbar-knowledge',
                      },
                  ]
                : []),
            {
                route: routes.guidance,
                title: GUIDANCE,
                exact: false,
            },
            ...(showAutomateActions
                ? [
                      {
                          route: routes.actions,
                          title: ACTIONS,
                          exact: false,
                          dataCanduId: 'ai-agent-navbar-actions',
                      },
                  ]
                : []),
            {
                route: routes.test,
                title: TEST,
            },
            ...(isGorgiasUser
                ? [
                      {
                          route: routes.previewMode,
                          title: PREVIEW,
                      },
                  ]
                : []),
        ],
        [
            isAiAgentKnowledgeTabEnabled,
            isAiAgentOptimizeTabEnabled,
            isGorgiasUser,
            routes,
            showAutomateActions,
        ]
    )

    return {headerNavbarItems, routes}
}
