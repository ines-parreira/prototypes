import type React from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { mockFeatureFlags } from 'tests/mockFeatureFlags'

import { SalesPaywallMiddlewareRouter } from '../SalesPaywallMiddlewareRouter'

jest.mock('../SalesPaywallMiddleware', () => ({
    SalesPaywallMiddleware:
        (ChildComponent: React.ComponentType<any>) => () => (
            <>
                <div>Sales Paywall V2</div>
                <ChildComponent />
            </>
        ),
}))

jest.mock('../SalesPaywallMiddlewareV3', () => ({
    SalesPaywallMiddlewareV3:
        (ChildComponent: React.ComponentType<any>) => () => (
            <>
                <div>Sales Paywall V3</div>
                <ChildComponent />
            </>
        ),
}))

const ChildComponent = () => <div>Child component</div>
const WrappedComponent = SalesPaywallMiddlewareRouter(ChildComponent)

describe('SalesPaywallMiddlewareRouter', () => {
    it('delegates to V2 middleware when AiAgentOnboardingV3 is disabled', () => {
        mockFeatureFlags({ [FeatureFlagKey.AiAgentOnboardingV3]: false })

        render(<WrappedComponent />)

        expect(screen.getByText('Sales Paywall V2')).toBeInTheDocument()
        expect(screen.queryByText('Sales Paywall V3')).not.toBeInTheDocument()
        expect(screen.getByText('Child component')).toBeInTheDocument()
    })

    it('delegates to V3 middleware when AiAgentOnboardingV3 is enabled', () => {
        mockFeatureFlags({ [FeatureFlagKey.AiAgentOnboardingV3]: true })

        render(<WrappedComponent />)

        expect(screen.getByText('Sales Paywall V3')).toBeInTheDocument()
        expect(screen.queryByText('Sales Paywall V2')).not.toBeInTheDocument()
        expect(screen.getByText('Child component')).toBeInTheDocument()
    })

    it('renders a loader while the flag is loading', () => {
        ;(useFlagWithLoading as jest.Mock).mockReturnValueOnce({
            value: false,
            isLoading: true,
        })

        render(<WrappedComponent />)

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
        expect(screen.queryByText('Sales Paywall V2')).not.toBeInTheDocument()
        expect(screen.queryByText('Sales Paywall V3')).not.toBeInTheDocument()
        expect(screen.queryByText('Child component')).not.toBeInTheDocument()
    })
})
