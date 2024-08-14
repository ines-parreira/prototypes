import {useMemo} from 'react'
import {ACTIONS} from 'pages/automate/common/components/constants'
import useShowAutomateActions from 'pages/automate/actions/hooks/useShowAutomateActions'

export const useAiAgentNavigation = ({shopName}: {shopName: string}) => {
    const showAutomateActions = useShowAutomateActions()

    const routes = useMemo(
        () => ({
            automation: `/app/automation`,
            test: `/app/automation/shopify/${shopName}/ai-agent/test`,
            guidance: `/app/automation/shopify/${shopName}/ai-agent/guidance`,
            newGuidanceArticle: `/app/automation/shopify/${shopName}/ai-agent/guidance/new`,
            configuration: `/app/automation/shopify/${shopName}/ai-agent`,
            guidanceArticleEdit: (articleId: number) =>
                `/app/automation/shopify/${shopName}/ai-agent/guidance/${articleId}`,
            guidanceTemplates: `/app/automation/shopify/${shopName}/ai-agent/guidance/templates`,
            newGuidanceTemplateArticle: (templateId: string) =>
                `/app/automation/shopify/${shopName}/ai-agent/guidance/templates/${templateId}`,
            actions: `/app/automation/shopify/${shopName}/ai-agent/actions`,
            newAction: (templateId?: string) =>
                `/app/automation/shopify/${shopName}/ai-agent/actions/new${
                    templateId ? `?template_id=${templateId}` : ''
                }`,
            actionsTemplates: `/app/automation/shopify/${shopName}/ai-agent/actions/templates`,
        }),
        [shopName]
    )

    const headerNavbarItems = useMemo(
        () => [
            {
                route: routes.configuration,
                title: 'Configuration',
                dataCanduId: 'ai-agent-navbar-configuration',
            },
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
        [routes, showAutomateActions]
    )

    return {headerNavbarItems, routes}
}
