import {fromJS, Map} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'

import {billingState} from 'fixtures/billing'
import {
    basicMonthlyHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import client from 'models/api/resources'
import * as constants from '../constants'
import * as actions from '../actions'
import {initialState} from '../reducers'
import {StoreDispatch} from '../../types'
import {AccountSettingType, AccountSetting} from '../types'
import {notify} from '../../notifications/actions'
import {assumeMock} from '../../../utils/testing'
import {NotificationStatus} from '../../notifications/types'

type MockedRootState = {
    currentAccount: Map<any, any>
    billing: Map<any, any>
}

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)

type fromJSType = typeof fromJS

jest.mock('init', () => {
    /* eslint-disable @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-member-access */
    const {fromJS} = jest.requireActual('immutable')
    const {billingState} = require('fixtures/billing')
    return {
        store: {
            getState: () => ({
                billing: (fromJS as fromJSType)(billingState),
            }),
        },
    }
})

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args: Record<string, unknown>) => args),
    }
})
const notifyMock = assumeMock(notify)

describe('current account actions', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({
            currentAccount: initialState,
            billing: fromJS(billingState),
        })
        mockServer = new MockAdapter(client)
    })

    it('update account', () => {
        const data = {id: 2}

        mockServer.onPut('/api/account/').reply(200, data)

        return store
            .dispatch(actions.updateAccount(data as any))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('submit setting', () => {
        it('creation', () => {
            const data = {hello: 'world'}

            mockServer.onPost('/api/account/settings/').reply(200, data)

            return store
                .dispatch(actions.submitSetting(data as any))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('update', () => {
            const data = {id: 1, hello: 'world'}

            mockServer.onPut('/api/account/settings/1/').reply(200, data)

            return store
                .dispatch(actions.submitSetting(data as any))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('update account owner', () => {
        it('update account owner', () => {
            const userId = 1

            mockServer.onPut('/api/account/owner/', {id: userId}).reply(202)

            return store
                .dispatch(actions.updateAccountOwner(userId))
                .then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                })
        })
    })

    describe('update subscription', () => {
        it('update subscription', () => {
            const subscription = {prices: [basicMonthlyHelpdeskPrice.price_id]}

            mockServer
                .onPut('/api/billing/subscription/')
                .reply(202, subscription)

            return store
                .dispatch(actions.updateSubscription(subscription))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('setCurrentSubscription()', () => {
        it('should return a Redux action to set the current subscription.', () => {
            const subscription = {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPrice.price_id,
                },
                status: 'active',
            }
            expect(
                actions.setCurrentSubscription(fromJS(subscription))
            ).toMatchSnapshot()
        })
    })

    describe('submitSettingSuccess', () => {
        it('should dispatch the next setting', () => {
            store = mockStore({
                currentAccount: initialState,
                billing: fromJS(billingState),
            })
            const req = {
                data: {
                    views: {
                        1: {display_order: 2},
                    },
                    views_top: {},
                    views_bottom: {},
                    view_sections: {},
                },
                id: 1,
                type: AccountSettingType.ViewsOrdering,
            } as AccountSetting

            store.dispatch(actions.submitSettingSuccess(req, false))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('cancel Helpdesk auto-renewal', () => {
        it('should successfully cancel', () => {
            const subscription = {
                prices: [basicMonthlyHelpdeskPrice.price_id],
                scheduled_to_cancel_at: '2024-04-09T00:43:06+00:00',
            }

            mockServer
                .onPut('/api/billing/subscription/')
                .reply(202, subscription)

            return store
                .dispatch(actions.cancelHelpdeskAutoRenewal())
                .then((res) => {
                    expect(store.getActions()).toEqual([
                        {
                            subscription: {
                                scheduled_to_cancel_at:
                                    '2024-04-09T00:43:06+00:00',
                            },
                            type: constants.UPDATE_SUBSCRIPTION_SUCCESS,
                        },
                    ])
                    expect(notifyMock).toHaveBeenCalledWith({
                        status: NotificationStatus.Success,
                        message:
                            'Your Helpdesk auto-renewal has been cancelled.',
                    })
                    expect(res).toEqual(true)
                })
        })

        it('should fail to cancel with a message from the server', () => {
            mockServer
                .onPut('/api/billing/subscription/')
                .reply(400, {error: {msg: 'error', data: []}})

            return store
                .dispatch(actions.cancelHelpdeskAutoRenewal())
                .then((res) => {
                    expect(store.getActions()).toEqual([])
                    expect(notifyMock).toHaveBeenCalledWith({
                        status: NotificationStatus.Error,
                        message: 'error',
                        allowHTML: true,
                    })
                    expect(res).toEqual(false)
                })
        })

        it('should fail to cancel with a default message', () => {
            mockServer
                .onPut('/api/billing/subscription/')
                .reply(500, {random: 'Response'})

            return store
                .dispatch(actions.cancelHelpdeskAutoRenewal())
                .then((res) => {
                    expect(store.getActions()).toEqual([])
                    expect(notifyMock).toHaveBeenCalledWith({
                        status: NotificationStatus.Error,
                        message: `Failed to cancel Helpdesk auto-renewal. If the problem persists, 
                           please contact our billing team via chat or at 
                           <a href="mailto:support@gorgias.com">support@gorgias.com</a> to make this change.`,
                        allowHTML: true,
                    })
                    expect(res).toEqual(false)
                })
        })
    })
})
