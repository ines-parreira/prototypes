import '@testing-library/jest-dom/extend-expect'

import React, { ComponentProps } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersonalityStep } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersonalityStep'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { StepProps } from 'pages/aiAgent/Onboarding/components/steps/types'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock, renderWithRouter } from 'utils/testing'

const trackRect = {
    left: 0,
    width: 400,
    right: 400,
    top: 0,
    bottom: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
}

const history = createMemoryHistory({
    initialEntries: [
        `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/${WizardStepEnum.SALES_PERSONALITY}`,
    ],
})

const queryClient = new QueryClient()

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

const mutateUpdateOnboardingMock = jest.fn()
jest.mock('pages/aiAgent/Onboarding/hooks/useUpdateOnboarding')
const useUpdateOnboardingMock = assumeMock(useUpdateOnboarding)

const goToStep = jest.fn()

const defaultProps: StepProps = {
    currentStep: 4,
    totalSteps: 6,
    goToStep,
}

const renderComponent = (
    props: ComponentProps<typeof PersonalityStep> = defaultProps,
) => {
    renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>
                <PersonalityStep {...props} />
            </Provider>
        </QueryClientProvider>,
        {
            history,
            path: '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            route: `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/${WizardStepEnum.SALES_PERSONALITY}`,
        },
    )
}

describe('PersonalityStep - With prepopulated data', () => {
    beforeAll(() => {
        queryClient.clear()

        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: {
                id: '1',
                salesPersuasionLevel: PersuasionLevel.Moderate,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesDiscountMax: 0.1,
                scopes: [AiAgentScopes.SALES],
                shopName: shopifyIntegration.meta.shop_name,
                currentStepName: WizardStepEnum.SALES_PERSONALITY,
            },
        })

        useUpdateOnboardingMock.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
        } as any)

        jest.useFakeTimers()
    })

    it('navigates to the next step when Next is clicked', async () => {
        renderComponent()

        jest.runAllTimers()

        await waitFor(() => {
            expect(screen.getByDisplayValue('10')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(
                screen.queryByText(/Maximum Discount Percentage/),
            ).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.KNOWLEDGE)
        })
    })
})

describe('PersonalityStep - Empty state', () => {
    beforeAll(() => {
        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: {
                id: '1',
                salesPersuasionLevel: PersuasionLevel.Moderate,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesDiscountMax: null,
                scopes: [AiAgentScopes.SALES],
                shopName: shopifyIntegration.meta.shop_name,
                currentStepName: WizardStepEnum.SALES_PERSONALITY,
            },
        })

        mutateUpdateOnboardingMock.mockImplementation(
            (data: any, { onSuccess }: { onSuccess: () => {} }) => {
                onSuccess()
            },
        )
        useUpdateOnboardingMock.mockReturnValue({
            mutate: mutateUpdateOnboardingMock,
            isLoading: false,
        } as any)

        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
        queryClient.clear()
    })

    it('should render without crashing', () => {
        renderComponent()

        jest.runAllTimers()

        expect(
            screen.getByRole('heading', {
                name: /Let's define the sales skills for your AI Agent/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Strikes a balance between educating the customer and encouraging them to make a purchase.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'The Sales AI Agent offers discounts at a level optimized for both conversions and profit.',
            ),
        ).toBeInTheDocument()
    })

    it('should update persuasion level description when moving slider', async () => {
        renderComponent()

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[0]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking beyond the end of track to select the last value
            fireEvent.click(track, {
                clientX: 500,
            })

            expect(
                screen.getByText(
                    'Prioritizes driving the sale with a strong focus on persuasion and urgency.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should update discount strategy description when moving slider', async () => {
        renderComponent()

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking beyond the end of track to select the last value
            fireEvent.click(track, {
                clientX: 500,
            })

            expect(
                screen.getByText(
                    'The Sales AI Agent frequently uses discounts to maximize sales, prioritizing conversions over margins.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should set max percentage to 0 when discount strategy is None', async () => {
        renderComponent()

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking before the start of track to select the first value
            fireEvent.click(track, {
                clientX: 0,
            })

            expect(
                screen.getByText(
                    'The Sales AI Agent will not offer any discounts under any circumstances.',
                ),
            ).toBeInTheDocument()
        })

        // Wait for maxDiscountPercentage to update in the DOM
        await waitFor(() => {
            const maxDiscountInput = screen.getByTestId('percentage-input')
            expect(maxDiscountInput).toBeInTheDocument()
            expect(maxDiscountInput.getAttribute('value')).toBe('0') // Ensure value is 0
        })
    })

    it('should update the max percentage discount when valid discount', async () => {
        renderComponent()

        const maxDiscountInput = screen.getByLabelText<HTMLInputElement>(
            /Maximum Discount Percentage/,
        )

        // Remove the default value
        userEvent.clear(maxDiscountInput)
        await userEvent.type(maxDiscountInput, '15')
        expect(maxDiscountInput).toHaveValue(15)

        await waitFor(() => {
            expect(
                screen.queryByText(/Must be a number between 1 and 100/i),
            ).not.toBeInTheDocument()
        })
    })

    it('should set max percentage to 8 when discount strategy is not None', async () => {
        renderComponent()

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking before the start of track to select the first value
            fireEvent.click(track, {
                clientX: 0,
            })

            expect(
                screen.getByText(
                    'The Sales AI Agent will not offer any discounts under any circumstances.',
                ),
            ).toBeInTheDocument()
        })

        // Wait for maxDiscountPercentage to update in the DOM
        await waitFor(() => {
            const maxDiscountInput = screen.getByTestId('percentage-input')
            expect(maxDiscountInput).toBeInTheDocument()
            expect(maxDiscountInput.getAttribute('value')).toBe('0') // Ensure value is 0
        })

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking beyond the end of track to select the last value
            fireEvent.click(track, {
                clientX: 500,
            })

            expect(
                screen.getByText(
                    'The Sales AI Agent frequently uses discounts to maximize sales, prioritizing conversions over margins.',
                ),
            ).toBeInTheDocument()
        })

        // Wait for maxDiscountPercentage to update in the DOM
        await waitFor(() => {
            const maxDiscountInput = screen.getByTestId('percentage-input')
            expect(maxDiscountInput).toBeInTheDocument()
            expect(maxDiscountInput.getAttribute('value')).toBe('8') // Ensure value is 0
        })
    })

    it('should update the max percentage discount and change the discount strategy when the value is 0', async () => {
        renderComponent()

        await waitFor(() => {
            const maxDiscountInput = screen.getByLabelText<HTMLInputElement>(
                /Maximum Discount Percentage/,
            )
            fireEvent.change(maxDiscountInput, { target: { value: '0' } })
            expect(maxDiscountInput.value).toBe('0')

            expect(
                screen.getByText(
                    'The Sales AI Agent will not offer any discounts under any circumstances.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should update the max percentage discount and show an error message when discount to high (101)', async () => {
        renderComponent()

        await waitFor(() => {
            const maxDiscountInput = screen.getByLabelText<HTMLInputElement>(
                /Maximum Discount Percentage/,
            )
            fireEvent.change(maxDiscountInput, { target: { value: '101' } })
            expect(maxDiscountInput.value).toBe('101')

            expect(
                screen.queryByText(/Must be a number between 1 and 100/i),
            ).toBeInTheDocument()
        })
    })

    it('navigates to the previous step when Back is clicked', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.queryByText(/Maximum Discount Percentage/),
            ).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText(/Back/i))

        await waitFor(() => {
            expect(goToStep).toHaveBeenCalledWith(
                WizardStepEnum.PERSONALITY_PREVIEW,
            )
        })
    })

    it('navigates to the knowledge step when Next is clicked', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.queryByText(/Maximum Discount Percentage/),
            ).toBeInTheDocument()
        })

        await waitFor(() => {
            const maxDiscountInput = screen.getByLabelText<HTMLInputElement>(
                /Maximum Discount Percentage/,
            )
            fireEvent.change(maxDiscountInput, { target: { value: '90' } })
            expect(maxDiscountInput.value).toBe('90')
        })

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.KNOWLEDGE)
        })
    })
})
