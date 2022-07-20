import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import {basicPlan, starterPlan} from 'fixtures/subscriptionPlan'
import {billingState} from 'fixtures/billing'
import {account} from 'fixtures/account'
import {PlanName} from 'utils/paywalls'
import UpgradeButton from 'pages/common/components/UpgradeButton'

import AutomationSubscriptionButton from '../AutomationSubscriptionButton'

const mockUpgradeButton = jest.fn()
jest.mock(
    'pages/common/components/UpgradeButton/UpgradeButton',
    () => (props: ComponentProps<typeof UpgradeButton>) => {
        mockUpgradeButton(props)
        return 'UpgradeButtonMock'
    }
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('AutomationSubscriptionButton', () => {
    const defaultState = {
        billing: fromJS({
            ...billingState,
            plans: fromJS({
                [basicPlan.id]: basicPlan,
                [starterPlan.id]: starterPlan,
            }),
        }),
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                plan: basicPlan.id,
                status: 'active',
            },
        }),
    } as RootState

    const minProps: ComponentProps<typeof AutomationSubscriptionButton> = {
        label: 'Foo',
        position: 'right',
        onClick: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should pass the props to the upgrade button', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AutomationSubscriptionButton {...minProps} />
            </Provider>
        )
        expect(mockUpgradeButton).toHaveBeenLastCalledWith(minProps)
    })

    it('should pass label "Upgrade" and undefined onClick and the state with automation add-on checked and basic plan modal opened to the upgrade button for the starter plan', () => {
        render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount.mergeDeep({
                        current_subscription: {
                            plan: starterPlan.id,
                        },
                    }),
                })}
            >
                <AutomationSubscriptionButton label="Foo" />
            </Provider>
        )
        expect(mockUpgradeButton).toHaveBeenCalledWith(
            expect.objectContaining({
                label: 'Upgrade',
                state: {
                    isAutomationAddOnChecked: true,
                    openedPlanModal: PlanName.Basic,
                },
                onClick: undefined,
            })
        )
    })
})
