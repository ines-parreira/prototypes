import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { mockFeatureFlags } from 'tests/mockFeatureFlags'

import { AiAgentOnboardingRouter } from '../AiAgentOnboardingRouter'

jest.mock(
    'pages/aiAgent/Onboarding_V2/components/AiAgentOnboarding/AiAgentOnboarding',
    () => ({
        AiAgentOnboarding: () => <div>AI Agent Onboarding V2</div>,
    }),
)

jest.mock(
    'pages/aiAgent/Onboarding_V3/components/AiAgentOnboarding/AiAgentOnboarding',
    () => ({
        AiAgentOnboardingV3: () => <div>AI Agent Onboarding V3</div>,
    }),
)

describe('AiAgentOnboardingRouter', () => {
    it('renders V2 onboarding when AiAgentOnboardingV3 is disabled', () => {
        mockFeatureFlags({ [FeatureFlagKey.AiAgentOnboardingV3]: false })

        render(<AiAgentOnboardingRouter />)

        expect(screen.getByText('AI Agent Onboarding V2')).toBeInTheDocument()
        expect(
            screen.queryByText('AI Agent Onboarding V3'),
        ).not.toBeInTheDocument()
    })

    it('renders V3 onboarding when AiAgentOnboardingV3 is enabled', () => {
        mockFeatureFlags({ [FeatureFlagKey.AiAgentOnboardingV3]: true })

        render(<AiAgentOnboardingRouter />)

        expect(screen.getByText('AI Agent Onboarding V3')).toBeInTheDocument()
        expect(
            screen.queryByText('AI Agent Onboarding V2'),
        ).not.toBeInTheDocument()
    })

    it('renders neither variant while the flag is loading', () => {
        ;(useFlagWithLoading as jest.Mock).mockReturnValueOnce({
            value: false,
            isLoading: true,
        })

        render(<AiAgentOnboardingRouter />)

        expect(
            screen.queryByText('AI Agent Onboarding V2'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('AI Agent Onboarding V3'),
        ).not.toBeInTheDocument()
    })
})
