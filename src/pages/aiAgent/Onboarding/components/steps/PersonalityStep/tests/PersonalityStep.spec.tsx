import '@testing-library/jest-dom/extend-expect'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'

import {fromJS, Map} from 'immutable'
import React, {ComponentProps} from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {chatIntegrationFixtures} from 'fixtures/chat'
import {shopifyIntegration, integrationsState} from 'fixtures/integrations'
import {PersonalityStep} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersonalityStep'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'

import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import {RootState, StoreDispatch} from 'state/types'

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

const queryClient = new QueryClient()

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const renderComponent = (props: ComponentProps<typeof PersonalityStep>) => {
    render(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>
                <PersonalityStep {...props} />
            </Provider>
        </QueryClientProvider>
    )
}

const goToStep = jest.fn()

describe('PersonalityStep', () => {
    const defaultProps: StepProps = {
        currentStep: 2,
        totalSteps: 8,
        goToStep,
    }

    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should render without crashing', () => {
        renderComponent(defaultProps)

        jest.runAllTimers()

        expect(
            screen.getByRole('heading', {
                name: /Let's define the sales skills for your AI Agent/i,
            })
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Strikes a balance between educating the customer and encouraging them to make a purchase.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'The Sales AI Agent offers discounts at a level optimized for both conversions and profit.'
            )
        ).toBeInTheDocument()
    })

    it('should update persuasion level description when moving slider', async () => {
        renderComponent(defaultProps)

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[0]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking beyond the end of track to select the last value
            fireEvent.click(track, {
                clientX: 500,
            })

            expect(
                screen.getByText(
                    'Prioritizes driving the sale with a strong focus on persuasion and urgency.'
                )
            ).toBeInTheDocument()
        })
    })

    it('should update discount strategy description when moving slider', async () => {
        renderComponent(defaultProps)

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking beyond the end of track to select the last value
            fireEvent.click(track, {
                clientX: 500,
            })

            expect(
                screen.getByText(
                    'The Sales AI Agent frequently uses discounts to maximize sales, prioritizing conversions over margins.'
                )
            ).toBeInTheDocument()
        })
    })

    it('should set max percentage to 0 when discount strategy is None', async () => {
        renderComponent(defaultProps)

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking before the start of track to select the first value
            fireEvent.click(track, {
                clientX: 0,
            })

            expect(
                screen.getByText(
                    'The Sales AI Agent will not offer any discounts under any circumstances.'
                )
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
        renderComponent(defaultProps)

        await waitFor(() => {
            const maxDiscountInput = screen.getByLabelText<HTMLInputElement>(
                /Maximum Discount Percentage/
            )
            fireEvent.change(maxDiscountInput, {target: {value: '10'}})
            expect(maxDiscountInput.value).toBe('10')

            expect(
                screen.queryByText(/Must be a number between 1 and 100/i)
            ).not.toBeInTheDocument()
        })
    })

    it('should update the max percentage discount and show an error message when discount to low (0)', async () => {
        renderComponent(defaultProps)

        await waitFor(() => {
            const maxDiscountInput = screen.getByLabelText<HTMLInputElement>(
                /Maximum Discount Percentage/
            )
            fireEvent.change(maxDiscountInput, {target: {value: '0'}})
            expect(maxDiscountInput.value).toBe('0')

            expect(
                screen.queryByText(/Must be a number between 1 and 100/i)
            ).toBeInTheDocument()
        })
    })

    it('should update the max percentage discount and show an error message when discount to high (101)', async () => {
        renderComponent(defaultProps)

        await waitFor(() => {
            const maxDiscountInput = screen.getByLabelText<HTMLInputElement>(
                /Maximum Discount Percentage/
            )
            fireEvent.change(maxDiscountInput, {target: {value: '101'}})
            expect(maxDiscountInput.value).toBe('101')

            expect(
                screen.queryByText(/Must be a number between 1 and 100/i)
            ).toBeInTheDocument()
        })
    })

    it('navigates to the personality preview step when Back is clicked', async () => {
        renderComponent(defaultProps)

        await waitFor(() => {
            expect(
                screen.queryByText(/Maximum Discount Percentage/)
            ).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText(/Back/i))

        await waitFor(() => {
            expect(goToStep).toHaveBeenCalledWith(
                WizardStepEnum.PERSONALITY_PREVIEW
            )
        })
    })

    it('navigates to the handover step when Next is clicked', async () => {
        renderComponent(defaultProps)

        await waitFor(() => {
            expect(
                screen.queryByText(/Maximum Discount Percentage/)
            ).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.HANDOVER)
        })
    })
})
