import type React from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { SalesPaywallMiddleware } from './SalesPaywallMiddleware'
import { SalesPaywallMiddlewareV3 } from './SalesPaywallMiddlewareV3'

export const SalesPaywallMiddlewareRouter = (
    ChildComponent: React.ComponentType<any>,
) => {
    const SalesPaywallV2 = SalesPaywallMiddleware(ChildComponent)
    const SalesPaywallV3 = SalesPaywallMiddlewareV3(ChildComponent)

    const SalesPaywallRouter = (): React.ReactElement | null => {
        const { value: isAiAgentOnboardingV3Enabled, isLoading } =
            useFlagWithLoading(FeatureFlagKey.AiAgentOnboardingV3, false)

        if (isLoading) return null

        const PaywallComponent = isAiAgentOnboardingV3Enabled
            ? SalesPaywallV3
            : SalesPaywallV2

        return <PaywallComponent />
    }

    const childName =
        ChildComponent.displayName ?? ChildComponent.name ?? 'Component'
    SalesPaywallRouter.displayName = `SalesPaywallRouter(${childName})`

    return SalesPaywallRouter
}
