import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

export const useAiAgentNavigation = ({shopName}: {shopName: string}) => {
    const showGuidance: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentGuidance]
    const showAiAgentPlayground: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentPlayground]

    const headerNavbarItems = [
        ...(showGuidance
            ? [
                  {
                      route: `/app/automation/shopify/${shopName}/ai-agent/guidance`,
                      title: 'Guidance',
                      exact: false,
                  },
              ]
            : []),
        {
            route: `/app/automation/shopify/${shopName}/ai-agent`,
            title: 'Configuration',
        },
        ...(showAiAgentPlayground
            ? [
                  {
                      route: `/app/automation/shopify/${shopName}/ai-agent/playground`,
                      title: 'Playground',
                  },
              ]
            : []),
    ]

    return {headerNavbarItems}
}
