import { screen } from '@testing-library/react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { render } from '@repo/testing'

import { OnboardingChecklist } from './OnboardingChecklist'

jest.mock('@repo/feature-flags')

const mockUseFlagWithLoading = jest.mocked(useFlagWithLoading)

describe('OnboardingChecklist', () => {
    beforeEach(() => {
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })
    })

    it('renders the checklist when the copilot-onboarding flag is enabled', () => {
        render(<OnboardingChecklist />)

        expect(mockUseFlagWithLoading).toHaveBeenCalledWith(
            FeatureFlagKey.CopilotOnboarding,
            false,
        )
        expect(screen.getByText('Get started')).toBeInTheDocument()
        expect(screen.getByText('3 of 4')).toBeInTheDocument()
        expect(
            screen.getByText('Connect support channel(s)'),
        ).toBeInTheDocument()
    })

    it('renders nothing while the flag is still loading', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: true,
        })

        render(<OnboardingChecklist />)

        expect(screen.queryByText('Get started')).not.toBeInTheDocument()
    })

    it('renders nothing when the flag is disabled', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<OnboardingChecklist />)

        expect(screen.queryByText('Get started')).not.toBeInTheDocument()
    })
})
