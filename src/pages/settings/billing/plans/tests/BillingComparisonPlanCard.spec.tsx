import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS, Map} from 'immutable'
import {Provider} from 'react-redux'

import BillingComparisonPlanCard from '../BillingComparisonPlanCard'
import {basicPlan, proPlan} from '../../../../../fixtures/subscriptionPlan'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {account} from '../../../../../fixtures/account'
import * as billingSelectors from '../../../../../state/billing/selectors'

jest.mock('popper.js')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<BillingComparisonPlanCard />', () => {
    let getCurrentPlanSpy: jest.SpyInstance

    beforeEach(() => {
        jest.resetAllMocks()
        getCurrentPlanSpy = jest.spyOn(billingSelectors, 'getCurrentPlan')
        getCurrentPlanSpy.mockImplementation(
            () => fromJS(basicPlan) as Map<any, any>
        )
    })

    afterEach(() => {
        getCurrentPlanSpy.mockRestore()
    })

    const defaultState: Partial<RootState> = {
        currentAccount: fromJS(account),
    }
    const onPlanChangeMock = jest.fn()
    const minProps: ComponentProps<typeof BillingComparisonPlanCard> = {
        plan: {...basicPlan, currencySign: '$'},
        isCurrentPlan: false,
        isUpdating: false,
        onPlanChange: onPlanChangeMock,
    }

    it('should render current plan', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard {...minProps} isCurrentPlan />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render not current plan', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render spinner when plan is updating', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard {...minProps} isUpdating={true} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the initial plan change confirmation', () => {
        const {getByRole} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    defaultIsPlanChangeConfirmationOpen={true}
                />
            </Provider>
        )
        expect(getByRole('tooltip')).toMatchSnapshot()
    })

    it('should render the plan upgrade confirmation', () => {
        const {getByRole} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    plan={{...proPlan, currencySign: '$'}}
                />
            </Provider>
        )
        fireEvent.click(getByRole('button', {name: 'Upgrade to Pro Plan'}))
        expect(getByRole('tooltip')).toMatchSnapshot()
    })

    it('should render the plan downgrade confirmation', () => {
        getCurrentPlanSpy.mockImplementation(
            () => fromJS(proPlan) as Map<any, any>
        )
        const {getByRole} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    plan={{...basicPlan, currencySign: '$'}}
                />
            </Provider>
        )
        fireEvent.click(getByRole('button', {name: 'Downgrade to Basic Plan'}))
        expect(getByRole('tooltip')).toMatchSnapshot()
    })

    it('should call onPlanChange callback and hide the confirmation popup on plan switch confirmation button click', () => {
        const {getByRole} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    plan={{...proPlan, currencySign: '$'}}
                />
            </Provider>
        )

        fireEvent.click(getByRole('button', {name: 'Upgrade to Pro Plan'}))
        fireEvent.click(getByRole('button', {name: 'Confirm plan change'}))

        expect(onPlanChangeMock).toHaveBeenCalledWith()
    })
})
