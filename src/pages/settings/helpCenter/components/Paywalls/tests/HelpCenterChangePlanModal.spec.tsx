import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from '../../../../../../state/types'
import {
    basicLegacyPlan,
    basicPlan,
    basicAutomationPlan,
} from '../../../../../../fixtures/subscriptionPlan'
import {PlanWithCurrencySign} from '../../../../../../state/billing/types'
import HelpCenterChangePlanModal from '../HelpCenterChangePlanModal'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const mockedDispatch = jest.fn()
jest.mock('../../../../../../hooks/useAppDispatch', () => () => mockedDispatch)

const mockedHandleSubscriptionUpdate = jest.fn()
jest.mock('react-use', () => {
    return {
        ...require.requireActual('react-use'),
        useAsyncFn: () => [{loading: false}, mockedHandleSubscriptionUpdate],
    } as Record<string, unknown>
})

describe('HelpCenterChangePlanModal', () => {
    const props = {
        isOpen: true,
        currentPlan: fromJS(basicLegacyPlan),
        suitablePlanWithoutAutomationAddOn: {
            ...basicPlan,
            currencySign: '$',
        } as PlanWithCurrencySign,
        onClose: jest.fn(),
    }

    it('should upgrade plan when clicking on the "Upgrade" button', async () => {
        const state: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: {
                    plan: basicLegacyPlan.id,
                },
            }),
            billing: fromJS({
                plans: fromJS({
                    [basicLegacyPlan.id]: basicLegacyPlan,
                    [basicPlan.id]: basicPlan,
                    [basicAutomationPlan.id]: basicAutomationPlan,
                }),
            }),
        }
        const {findByRole} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterChangePlanModal {...props} />
            </Provider>
        )

        const upgradeButton = await findByRole('button', {
            name: /confirm upgrade/i,
        })

        fireEvent.click(upgradeButton)

        expect(mockedHandleSubscriptionUpdate).toHaveBeenCalledWith(
            'basic-monthly-usd-2'
        )
    })
})
