import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'
import {FeatureFlagKey} from 'config/featureFlags'

export const useAiAgentNavigation = ({shopName}: {shopName: string}) => {
    const showGuidance: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentGuidance]
    const showAiAgentPlayground: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentPlayground]

    const routes = useMemo(
        () => ({
            playground: `/app/automation/shopify/${shopName}/ai-agent/playground`,
            guidance: `/app/automation/shopify/${shopName}/ai-agent/guidance`,
            newGuidanceArticle: `/app/automation/shopify/${shopName}/ai-agent/guidance/new`,
            configuration: `/app/automation/shopify/${shopName}/ai-agent`,
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
            ...(showAiAgentPlayground
                ? [
                      {
                          route: routes.playground,
                          title: 'Playground',
                      },
                  ]
                : []),
        ],
        [routes, showAiAgentPlayground, showGuidance]
    )

    return {headerNavbarItems, routes}
}
