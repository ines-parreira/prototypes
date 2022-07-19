import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import {account} from 'fixtures/account'
import {basicPlan, starterPlan} from 'fixtures/subscriptionPlan'
import {billingState} from 'fixtures/billing'

import {GorgiasChatIntegrationSelfServicePaywall} from '../GorgiasChatIntegrationSelfServicePaywall'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('GorgiasChatIntegrationSelfServicePaywall', () => {
    const defaultState = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                status: 'active',
                plan: basicPlan.id,
            },
        }),
        billing: fromJS({
            ...billingState,
            plans: fromJS({
                [basicPlan.id]: basicPlan,
                [starterPlan.id]: starterPlan,
            }),
        }),
    } as RootState

    it('should render the paywall', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationSelfServicePaywall />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show modal on button click', () => {
        const {getByText, getByRole} = render(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationSelfServicePaywall />
            </Provider>
        )

        fireEvent.click(getByText('Add Automation Features'))

        expect(getByRole('dialog')).toMatchSnapshot()
    })

    it('should render update button for the starter plan', () => {
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            plan: starterPlan.id,
                        },
                    }),
                })}
            >
                <GorgiasChatIntegrationSelfServicePaywall />
            </Provider>
        )
        expect(getByText('Upgrade')).toBeTruthy()
    })
})
