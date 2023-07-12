import React from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import userEvent from '@testing-library/user-event'
import {RootState, StoreDispatch} from 'state/types'
import {automationProduct} from 'fixtures/productPrices'
import {billingState} from 'fixtures/billing'
import AutomationPlanSubscriptionDescription, {
    AutomationPlanSubscriptionDescriptionProps,
} from '../AutomationPlanSubscriptionDescription'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const defaultState: Partial<RootState> = {
    billing: fromJS(billingState),
}

describe('AutomationPlanSubscriptionDescription', () => {
    const mockAutomationPrices = automationProduct.prices

    const mockSetSelectedPrice = jest.fn()
    const mockSetIsSubscriptionEnabled = jest.fn()

    const defaultProps: AutomationPlanSubscriptionDescriptionProps = {
        automationPrices: mockAutomationPrices,
        isStarterPlan: false,
        isEnterprisePlan: false,
        selectedPrice: mockAutomationPrices[0],
        setSelectedPrice: mockSetSelectedPrice,
        setIsSubscriptionEnabled: mockSetIsSubscriptionEnabled,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('displays correct plan options in select field', () => {
        render(
            <Provider store={mockedStore(defaultState)}>
                <AutomationPlanSubscriptionDescription {...defaultProps} />
            </Provider>
        )
        const proOption = screen.getByText('190')
        const enterpriseOption = screen.getByText('530+')

        expect(proOption).toBeInTheDocument()
        expect(enterpriseOption).toBeInTheDocument()
    })

    it('calls setSelectedPrice when a plan option is selected', () => {
        render(
            <Provider store={mockedStore(defaultState)}>
                <AutomationPlanSubscriptionDescription {...defaultProps} />
            </Provider>
        )
        const proOption = screen.getByText('190')

        userEvent.click(proOption)

        expect(mockSetSelectedPrice).toHaveBeenCalledWith(
            mockAutomationPrices[2]
        )
    })

    it('displays the plan price correctly', () => {
        render(
            <Provider store={mockedStore(defaultState)}>
                <AutomationPlanSubscriptionDescription {...defaultProps} />
            </Provider>
        )
        const planPrice = screen.getByText('$30/month')
        expect(planPrice).toBeInTheDocument()
    })

    it('displays enterprise description when isEnterprisePlan is true', () => {
        const props = {...defaultProps, isEnterprisePlan: true}
        render(
            <Provider store={mockedStore(defaultState)}>
                <AutomationPlanSubscriptionDescription {...props} />
            </Provider>
        )
        const enterpriseDescription = screen.getByText(
            'Contact our team to subscribe to an Enterprise plan.'
        )

        expect(enterpriseDescription).toBeInTheDocument()
    })

    it('displays error alert and description when isStarterPlan is true', () => {
        const props = {...defaultProps, isStarterPlan: true}
        render(
            <Provider store={mockedStore(defaultState)}>
                <AutomationPlanSubscriptionDescription {...props} />
            </Provider>
        )
        const errorAlert = screen.getByText(
            `You're on a Starter plan. Upgrade your Helpdesk subscription to unlock Automation.`
        )
        const starterDescription = screen.getByText(
            'Please upgrade your Helpdesk plan to Basic, Pro, Advanced or Enterprise in order to subscribe to Automation.'
        )

        expect(errorAlert).toBeInTheDocument()
        expect(starterDescription).toBeInTheDocument()
    })
})
