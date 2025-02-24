import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, act} from '@testing-library/react'

import {createMemoryHistory} from 'history'
import {fromJS, Map} from 'immutable'
import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {chatIntegrationFixtures} from 'fixtures/chat'
import {shopifyIntegration, integrationsState} from 'fixtures/integrations'
import {
    getOnboardingData,
    updateOnboardingData,
} from 'models/aiAgent/resources/configuration'
import {PersonalityPreviewStep} from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/PersonalityPreviewStep'
import {DiscountStrategy} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import {PersuasionLevel} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'

jest.mock('models/aiAgent/resources/configuration', () => ({
    getOnboardingData: jest.fn(),
    updateOnboardingData: jest.fn(),
}))

const mockGetOnboardingData = getOnboardingData as jest.Mock
const mockUpdateOnboardingData = updateOnboardingData as jest.Mock

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const history = createMemoryHistory({
    initialEntries: [
        `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/${WizardStepEnum.PERSONALITY_PREVIEW}`,
    ],
})

const queryClient = new QueryClient()

const goToStep = jest.fn()

const renderComponent = (state?: RootState) => {
    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state ?? defaultState)}>
                <PersonalityPreviewStep
                    currentStep={3}
                    totalSteps={6}
                    goToStep={goToStep}
                />
            </Provider>
        </QueryClientProvider>,
        {
            history,
            path: '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            route: `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/${WizardStepEnum.PERSONALITY_PREVIEW}`,
        }
    )
}

describe('<PersonalityPreviewStep />', () => {
    describe.each([
        ['sales', [AiAgentScopes.SALES]],
        ['support', [AiAgentScopes.SUPPORT]],
        ['mixed', [AiAgentScopes.SALES, AiAgentScopes.SUPPORT]],
    ])('with scope defined as %s', (scopeName, scopes) => {
        beforeEach(() => {
            // ✅ Mock getOnboardingData function
            mockGetOnboardingData.mockResolvedValue(
                Promise.resolve([
                    {
                        id: 1,
                        salesPersuasionLevel: PersuasionLevel.Moderate,
                        salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                        salesDiscountMax: 0.8,
                        scopes,
                        shopName: shopifyIntegration.meta.shop_name,
                    },
                ])
            )

            // // ✅ Mock updateOnboardingData function
            mockUpdateOnboardingData.mockResolvedValue(
                Promise.resolve({
                    success: true,
                })
            )
        })

        it('should render with the title', () => {
            const screen = renderComponent()

            expect(
                screen.getByText('Now see how your AI Agent will respond to')
            ).toBeInTheDocument()
        })

        it('should select the first personality preview', () => {
            const screen = renderComponent()

            expect(screen.getAllByRole('radio')[0]).not.toHaveAttribute(
                'aria-busy'
            )

            expect(screen.getAllByRole('radio')[0]).toHaveAttribute(
                'aria-checked',
                'true'
            )
            expect(screen.getAllByRole('radio')[1]).toHaveAttribute(
                'aria-checked',
                'false'
            )
        })

        it('should allow selecting any preview item', () => {
            const screen = renderComponent()

            expect(screen.getAllByRole('radio')[0]).toHaveAttribute(
                'aria-checked',
                'true'
            )
            expect(screen.getAllByRole('radio')[1]).toHaveAttribute(
                'aria-checked',
                'false'
            )

            act(() => {
                fireEvent.click(screen.getAllByRole('radio')[1])
            })

            expect(screen.getAllByRole('radio')[0]).toHaveAttribute(
                'aria-checked',
                'false'
            )
            expect(screen.getAllByRole('radio')[1]).toHaveAttribute(
                'aria-checked',
                'true'
            )
        })

        it('navigates to the previous step when Back is clicked', () => {
            const screen = renderComponent()

            const backButtons = screen.getAllByText(/Back/i)

            fireEvent.click(backButtons[1] || backButtons[0])

            expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.CHANNELS)
        })

        it('navigates to the next step when Next is clicked', () => {
            const screen = renderComponent()

            fireEvent.click(screen.getByText(/Next/i))

            const expectedCalledWith = WizardStepEnum.SALES_PERSONALITY

            expect(goToStep).toHaveBeenCalledWith(expectedCalledWith)
        })
    })
})
