import '@testing-library/jest-dom/extend-expect'

import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { HandoverStep } from 'pages/aiAgent/Onboarding/components/steps/HandoverStep/HandoverStep'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock, renderWithRouter } from 'utils/testing'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData')
const useGetOnboardingDataMock = assumeMock(useGetOnboardingData)

jest.mock('pages/aiAgent/Onboarding/hooks/useUpdateOnboarding')
const mockUpdateOnboardingMock = assumeMock(useUpdateOnboarding)

const mockGoToStep = jest.fn()

const history = createMemoryHistory({
    initialEntries: [
        `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/handover`,
    ],
})

const queryClient = new QueryClient()

const renderComponent = () => {
    renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>
                <HandoverStep
                    currentStep={5}
                    totalSteps={6}
                    goToStep={mockGoToStep}
                />
            </Provider>
        </QueryClientProvider>,
        {
            history,
            path: '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            route: `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/handover`,
        },
    )
}

describe('HandoverStep', () => {
    beforeEach(() => {
        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: {
                id: '1',
                salesPersuasionLevel: PersuasionLevel.Moderate,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesDiscountMax: 0.8,
                scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                shopName: shopifyIntegration.meta.shop_name,
                currentStepName: WizardStepEnum.HANDOVER,
            },
        })

        mockUpdateOnboardingMock.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
        } as any)
    })

    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should render without crashing', () => {
        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText('Handover step')).toBeInTheDocument()
    })

    it('navigates to the Knowledge step when Next is clicked', () => {
        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText('Handover step')).toBeInTheDocument()

        fireEvent.click(screen.getByText(/Next/i))

        expect(mockGoToStep).toHaveBeenCalled()
    })

    it('navigates back to SALES_PERSONALITY if agent includes SALES', async () => {
        renderComponent()

        jest.runAllTimers()

        await waitFor(() => {
            expect(screen.getByText('Handover step')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText(/Back/i))
        expect(mockGoToStep).toHaveBeenCalled()
    })
})
