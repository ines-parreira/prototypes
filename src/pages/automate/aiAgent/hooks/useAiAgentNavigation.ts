import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'
import {FeatureFlagKey} from 'config/featureFlags'

export const useAiAgentNavigation = ({shopName}: {shopName: string}) => {
    const showGuidance: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentGuidance]

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
        }),
        [shopName]
    )

    const headerNavbarItems = useMemo(
        () => [
            ...(showGuidance
                ? [
                      {
                          route: routes.guidance,
                          title: 'Guidance',
                          exact: false,
                      },
                  ]
                : []),
            {
                route: routes.configuration,
                title: 'Configuration',
            },

            {
                route: routes.test,
                title: 'Test',
            },
        ],
        [routes, showGuidance]
    )

    return {headerNavbarItems, routes}
}
