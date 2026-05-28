import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { mockFeatureFlags } from 'tests/mockFeatureFlags'

import { AiAgentOnboardingRouter } from '../AiAgentOnboardingRouter'

jest.mock(
    'pages/aiAgent/Onboarding_V2/components/AiAgentOnboarding/AiAgentOnboarding',
    () => ({
        AiAgentOnboarding: () => <div>AI Agent Onboarding</div>,
    }),
)

describe('AiAgentOnboardingRouter', () => {
    it('renders the wizard inline when AiAgentOnboardingV3 is disabled', () => {
        mockFeatureFlags({ [FeatureFlagKey.AiAgentOnboardingV3]: false })

        const { container } = render(<AiAgentOnboardingRouter />)

        expect(container).toHaveTextContent('AI Agent Onboarding')
    })

    it('hides page banners on the V2 path', () => {
        mockFeatureFlags({ [FeatureFlagKey.AiAgentOnboardingV3]: false })

        document.body.innerHTML = `
            <div class="ui-banner-banner" style="display: block;">Banner 1</div>
        `

        render(<AiAgentOnboardingRouter />)

        const banner = document.querySelector(
            '.ui-banner-banner',
        ) as HTMLElement
        expect(banner.style.display).toBe('none')
    })

    it('does not hide page banners on the V3 path', () => {
        mockFeatureFlags({ [FeatureFlagKey.AiAgentOnboardingV3]: true })

        document.body.innerHTML = `
            <div class="ui-banner-banner" style="display: block;">Banner 1</div>
        `

        render(<AiAgentOnboardingRouter />)

        const banner = document.querySelector(
            '.ui-banner-banner',
        ) as HTMLElement
        expect(banner.style.display).toBe('block')
    })

    it('portals the wizard out of the route container when AiAgentOnboardingV3 is enabled', () => {
        mockFeatureFlags({ [FeatureFlagKey.AiAgentOnboardingV3]: true })

        const { container } = render(<AiAgentOnboardingRouter />)

        expect(container).not.toHaveTextContent('AI Agent Onboarding')
        expect(screen.getByText('AI Agent Onboarding')).toBeInTheDocument()
    })

    it('renders a loader while the flag is loading', () => {
        ;(useFlagWithLoading as jest.Mock).mockReturnValueOnce({
            value: false,
            isLoading: true,
        })

        render(<AiAgentOnboardingRouter />)

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
        expect(
            screen.queryByText('AI Agent Onboarding'),
        ).not.toBeInTheDocument()
    })
})
