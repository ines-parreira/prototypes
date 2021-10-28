import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {
    advancedPlan,
    basicPlan,
    customPlan,
    enterprisePlan,
    legacyPlan,
    proPlan,
} from '../../../../../fixtures/subscriptionPlan'
import {account} from '../../../../../fixtures/account'
import {Plan} from '../../../../../models/billing/types'
import {RootState, StoreDispatch} from '../../../../../state/types'
import * as billingSelectors from '../../../../../state/billing/selectors'
import BillingPlanCard from '../BillingPlanCard'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.mock('lodash/uniqueId', () => (id: string) => `${id}42`)

describe('<BillingPlanCard />', () => {
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS(account),
    }

    const minProps: ComponentProps<typeof BillingPlanCard> = {
        plan: {...basicPlan, currencySign: '$'},
        isCurrentPlan: false,
        footer: <span>Foo footer</span>,
        className: 'fooClass',
    }

    it.each<[string, Plan]>([
        ['Basic plan', basicPlan],
        ['Advanced plan', advancedPlan],
        ['Pro plan', proPlan],
        ['Enterprise plan', enterprisePlan],
        ['Custom plan', customPlan],
        ['Legacy plan', legacyPlan],
    ])('should render plan card for the %s', (testName, plan) => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingPlanCard
                    {...minProps}
                    plan={{...plan, currencySign: '$'}}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the legacy badge for legacy plan when the account is current', () => {
        const hasLegacyPlanSpy = jest.spyOn(billingSelectors, 'hasLegacyPlan')
        hasLegacyPlanSpy.mockImplementation(() => true)

        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingPlanCard
                    {...minProps}
                    plan={{...legacyPlan, currencySign: '$'}}
                    isCurrentPlan
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
