import {
    FeatureFlagKey,
    useAreFlagsLoading,
    useFlag,
} from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { AiAgentOnboardingRedirect } from './AiAgentOnboardingRedirect'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
    useAreFlagsLoading: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)
const useAreFlagsLoadingMock = assumeMock(useAreFlagsLoading)

// Mock the navigation hook
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            onboardingWizardStep: (step: string) =>
                `/app/ai-agent/shopify/test-shop/onboarding/${step}`,
        },
    }),
}))

describe('AiAgentOnboardingRedirect', () => {
    const renderComponent = () => {
        return render(
            <MemoryRouter
                initialEntries={['/app/ai-agent/shopify/test-shop/onboarding']}
            >
                <Route
                    exact
                    path="/app/ai-agent/:shopType/:shopName/onboarding"
                    component={AiAgentOnboardingRedirect}
                />
                <Route path="/app/ai-agent/:shopType/:shopName/onboarding/:step">
                    {({ match }) => <div>Step: {match?.params.step}</div>}
                </Route>
            </MemoryRouter>,
        )
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Loading State', () => {
        beforeEach(() => {
            useAreFlagsLoadingMock.mockReturnValue(true)
            useFlagMock.mockReturnValue(false)
        })

        it('should not redirect while flags are loading', () => {
            const { queryByText } = renderComponent()
            expect(queryByText(/Step: channels/i)).not.toBeInTheDocument()
            expect(queryByText(/Step: tone of voice/i)).not.toBeInTheDocument()
        })
    })

    describe('V1 Flow (Feature Flag OFF)', () => {
        beforeEach(() => {
            useAreFlagsLoadingMock.mockReturnValue(false)
            useFlagMock.mockReturnValue(false)
        })

        it('should redirect to CHANNELS step', () => {
            const { getByText } = renderComponent()
            expect(getByText('Step: channels')).toBeInTheDocument()
        })
    })

    describe('V2 Flow (Feature Flag ON)', () => {
        beforeEach(() => {
            useAreFlagsLoadingMock.mockReturnValue(false)
            useFlagMock.mockImplementation((key: string) => {
                if (key === FeatureFlagKey.SimplifyAIAgentOnboardingWizard) {
                    return true
                }
                return false
            })
        })

        it('should redirect to TONE_OF_VOICE step', () => {
            const { getByText } = renderComponent()
            expect(getByText('Step: tone of voice')).toBeInTheDocument()
        })
    })
})
