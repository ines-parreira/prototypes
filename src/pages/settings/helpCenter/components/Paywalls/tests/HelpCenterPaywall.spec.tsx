import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from '../../../../../../state/types'
import {
    basicLegacyPlan,
    proLegacyPlan,
    advancedLegacyPlan,
    customLegacyPlan,
    basicPlan,
    proPlan,
    advancedPlan,
} from '../../../../../../fixtures/subscriptionPlan'

import HelpCenterPaywall from '../HelpCenterPaywall'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
let mockedOpenChat: typeof jest.fn
jest.mock('../../../../../../utils', () => {
    const mock = {
        ...jest.requireActual('../../../../../../utils'),
        openChat: jest.fn(),
    } as Record<string, any>

    mockedOpenChat = mock.openChat
    return mock
})

describe('HelpCenterPaywall', () => {
    it('should render the component correctly for "Basic" legacy plan', () => {
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
                }),
            }),
        }

        const {container} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterPaywall />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the component correctly "for" Pro legacy plan', () => {
        const state: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: {
                    plan: proLegacyPlan.id,
                },
            }),
            billing: fromJS({
                plans: fromJS({
                    [proLegacyPlan.id]: proLegacyPlan,
                    [proPlan.id]: proPlan,
                }),
            }),
        }
        const {container} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterPaywall />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the component correctly for "Advanced" legacy plan', () => {
        const state: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: {
                    plan: advancedLegacyPlan.id,
                },
            }),
            billing: fromJS({
                plans: fromJS({
                    [advancedLegacyPlan.id]: advancedLegacyPlan,
                    [advancedPlan.id]: advancedPlan,
                }),
            }),
        }
        const {container} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterPaywall />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the component correctly for "Enterprise" legacy plan', () => {
        const state: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: {
                    plan: customLegacyPlan.id,
                },
            }),
            billing: fromJS({
                plans: fromJS({
                    [customLegacyPlan.id]: customLegacyPlan,
                }),
            }),
        }
        const {container} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterPaywall />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should open the chat when clicking on "Contact us" button', async () => {
        const state: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: {
                    plan: customLegacyPlan.id,
                },
            }),
            billing: fromJS({
                plans: fromJS({
                    [customLegacyPlan.id]: customLegacyPlan,
                }),
            }),
        }
        const {findByRole} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterPaywall />
            </Provider>
        )

        const contactUsButton = await findByRole('button', {
            name: /contact us/i,
        })

        fireEvent.click(contactUsButton)

        expect(mockedOpenChat).toHaveBeenCalledTimes(1)
    })
})
