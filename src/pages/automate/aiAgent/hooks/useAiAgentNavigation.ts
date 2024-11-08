import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import useShowAutomateActions from 'pages/automate/actions/hooks/useShowAutomateActions'
import {ACTIONS} from 'pages/automate/common/components/constants'

export const useAiAgentNavigation = ({shopName}: {shopName: string}) => {
    const showAutomateActions = useShowAutomateActions()

    const isAiAgentKnowledgeTabEnabled =
        useFlags()[FeatureFlagKey.AiAgentKnowledgeTab]

    const routes = useMemo(
        () => ({
            automation: `/app/automation`,
            test: `/app/automation/shopify/${shopName}/ai-agent/test`,
            guidance: `/app/automation/shopify/${shopName}/ai-agent/guidance`,
            knowledge: `/app/automation/shopify/${shopName}/ai-agent/knowledge`,
            newGuidanceArticle: `/app/automation/shopify/${shopName}/ai-agent/guidance/new`,
            configuration: (section?: 'knowledge' | 'email') =>
                `/app/automation/shopify/${shopName}/ai-agent${
                    section ? `?section=${section}` : ''
                }`,
            guidanceArticleEdit: (articleId: number) =>
                `/app/automation/shopify/${shopName}/ai-agent/guidance/${articleId}`,
            guidanceTemplates: `/app/automation/shopify/${shopName}/ai-agent/guidance/templates`,
            guidanceLibrary: `/app/automation/shopify/${shopName}/ai-agent/guidance/library`,
            newGuidanceTemplateArticle: (templateId: string) =>
                `/app/automation/shopify/${shopName}/ai-agent/guidance/templates/${templateId}`,
            newGuidanceAiSuggestionArticle: (aiGuidanceId: string) =>
                `/app/automation/shopify/${shopName}/ai-agent/guidance/library/${aiGuidanceId}`,
            actions: `/app/automation/shopify/${shopName}/ai-agent/actions`,
            newAction: (templateId?: string) =>
                `/app/automation/shopify/${shopName}/ai-agent/actions/new${
                    templateId ? `?template_id=${templateId}` : ''
                }`,
            editAction: (configurationId: string) =>
                `/app/automation/shopify/${shopName}/ai-agent/actions/edit/${configurationId}`,
            actionsTemplates: `/app/automation/shopify/${shopName}/ai-agent/actions/templates`,
            actionEvents: (configurationId: string) =>
                `/app/automation/shopify/${shopName}/ai-agent/actions/events/${configurationId}`,
            onboardingWizard: `/app/automation/shopify/${shopName}/ai-agent/new`,
        }),
        [shopName]
    )

    const headerNavbarItems = useMemo(
        () => [
            {
                route: routes.configuration(),
                title: 'Settings',
                dataCanduId: 'ai-agent-navbar-configuration',
            },
            ...(isAiAgentKnowledgeTabEnabled
                ? [
                      {
                          route: routes.knowledge,
                          title: 'Knowledge',
                          dataCanduId: 'ai-agent-navbar-knowledge',
                      },
                  ]
                : []),
            {
                route: routes.guidance,
                title: 'Guidance',
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
                title: 'Test',
            },
        ],
        [isAiAgentKnowledgeTabEnabled, routes, showAutomateActions]
    )

    return {headerNavbarItems, routes}
}
