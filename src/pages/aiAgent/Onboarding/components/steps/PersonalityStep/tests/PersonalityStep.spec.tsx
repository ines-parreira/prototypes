import '@testing-library/jest-dom/extend-expect'
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import {fromJS, Map} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {billingState} from 'fixtures/billing'
import {shopifyIntegration} from 'fixtures/integrations'
import {user} from 'fixtures/users'

import {OnboardingContextProvider} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'
import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

import {PersonalityStep} from '../PersonalityStep'

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

const renderComponent = (props: ComponentProps<typeof PersonalityStep>) => {
    const defaultState = {
        billing: fromJS(billingState),
        currentUser: Map(user),
    }
    const defaultOnboardingContextData = {
        lastStep: WizardStepEnum.SALES_PERSONALITY,
        scope: [AiAgentScopes.SUPPORT],
        shopName: shopifyIntegration.meta.shop_name,
    }

    render(
        <OnboardingContextProvider initialData={defaultOnboardingContextData}>
            <Provider store={configureMockStore()(defaultState)}>
                <PersonalityStep {...props} />
            </Provider>
        </OnboardingContextProvider>
    )
}

describe('PersonalityStep', () => {
    const defaultProps = {
        currentStep: 1,
        totalSteps: 8,
        onBackClick: jest.fn(),
        onNextClick: jest.fn(),
    }

    jest.useFakeTimers()

    it('should render without crashing', async () => {
        renderComponent(defaultProps)
        act(() => jest.runAllTimers())

        await waitFor(() => {
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
    })

    it('should call next', () => {
        renderComponent(defaultProps)
        act(() => jest.runAllTimers())

        const nextButton = screen.getByText('Next')
        userEvent.click(nextButton)
        expect(defaultProps.onNextClick).toHaveBeenCalled()
    })

    it('should update persuasion level description when moving slider', async () => {
        renderComponent(defaultProps)
        act(() => jest.runAllTimers())

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
        act(() => jest.runAllTimers())

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
        act(() => jest.runAllTimers())

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
            const maxDiscountInput = screen.getByLabelText<HTMLInputElement>(
                /Maximum Discount Percentage/
            )
            expect(maxDiscountInput.value).toBe('0')
            expect(maxDiscountInput.disabled).toBe(true)
        })
    })

    it('should update the max percentage discount when valid discount', async () => {
        renderComponent(defaultProps)
        act(() => jest.runAllTimers())

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
        act(() => jest.runAllTimers())

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
        act(() => jest.runAllTimers())

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
})
