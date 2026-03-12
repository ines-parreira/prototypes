import { assumeMock } from '@repo/testing'
import MockAdapter from 'axios-mock-adapter'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    AgentsTableColumn,
    ChannelsTableColumns,
    ProductInsightsTableColumns,
} from 'domains/reporting/state/ui/stats/types'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/plans'
import client from 'models/api/resources'
import {
    submitAgentAvailabilityTableConfigView,
    submitAgentTableConfigView,
    submitChannelsTableConfigView,
    submitProductInsightsTableConfigView,
} from 'state/currentAccount/actions'
import * as actions from 'state/currentAccount/actions'
import * as constants from 'state/currentAccount/constants'
import { initialState } from 'state/currentAccount/reducers'
import type { AccountSetting } from 'state/currentAccount/types'
import { AccountSettingType } from 'state/currentAccount/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { StoreDispatch } from 'state/types'

type MockedRootState = {
    currentAccount: Map<any, any>
    billing: Map<any, any>
}

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares,
)

type fromJSType = typeof fromJS

jest.mock('init', () => {
    /* eslint-disable @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-member-access */
    const { fromJS } = jest.requireActual('immutable')
    const { billingState } = require('fixtures/billing')
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
        const data = { id: 2 }

        mockServer.onPut('/api/account/').reply(200, data)

        return store
            .dispatch(actions.updateAccount(data as any))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('submit setting', () => {
        it('creation', () => {
            const data = { hello: 'world' }

            mockServer.onPost('/api/account/settings/').reply(200, data)

            return store
                .dispatch(actions.submitSetting(data as any))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('update', () => {
            const data = { id: 1, hello: 'world' }

            mockServer.onPut('/api/account/settings/1/').reply(200, data)

            return store
                .dispatch(actions.submitSetting(data as any))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('update account owner', () => {
        it('update account owner', () => {
            const userId = 1

            mockServer.onPut('/api/account/owner/', { id: userId }).reply(202)

            return store
                .dispatch(actions.updateAccountOwner(userId))
                .then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                })
        })
    })

    describe('update subscription', () => {
        beforeEach(() => {
            const updatedSubscription = {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                },
            }

            mockServer
                .onPut('/api/billing/subscription/')
                .reply(202, updatedSubscription)
        })

        it('should update subscription', () => {
            return store
                .dispatch(
                    actions.updateSubscription({
                        prices: [basicMonthlyHelpdeskPlan.plan_id],
                    }),
                )
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should notify that the update was successful', () => {
            return store
                .dispatch(
                    actions.updateSubscription({
                        prices: [basicMonthlyHelpdeskPlan.plan_id],
                    }),
                )
                .then(() =>
                    expect(notifyMock).toHaveBeenCalledWith({
                        status: NotificationStatus.Success,
                        message: 'Your subscription was updated.',
                    }),
                )
        })

        describe('when the update fails', () => {
            beforeEach(() => {
                mockServer.onPut('/api/billing/subscription/').reply(400)
            })

            it('should dispatch that the update failed', () => {
                return store
                    .dispatch(
                        actions.updateSubscription({
                            prices: [basicMonthlyHelpdeskPlan.plan_id],
                        }),
                    )
                    .then(() => expect(store.getActions()).toMatchSnapshot())
            })
        })
    })

    describe('update subscription product plans', () => {
        it('updates the local state with the current subscription product plans', () => {
            const currentSubscription = {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                    [AUTOMATION_PRODUCT_ID]: basicMonthlyAutomationPlan.plan_id,
                },
            }

            mockServer
                .onPut('/api/billing/subscription/')
                .reply(202, currentSubscription)

            return store
                .dispatch(
                    actions.updateSubscriptionsForPlans(
                        { helpdesk: basicMonthlyHelpdeskPlan.plan_id },
                        [],
                    ),
                )
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('setCurrentSubscription()', () => {
        it('should return a Redux action to set the current subscription.', () => {
            const subscription = {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                },
                status: 'active',
            }
            expect(
                actions.setCurrentSubscription(fromJS(subscription)),
            ).toMatchSnapshot()
        })
    })

    describe('fetchAccountSettings()', () => {
        it('should return a Redux action to get the account settings.', () => {
            const settings = {
                data: {
                    email: 1,
                },
                type: AccountSettingType.DefaultIntegration,
            }

            mockServer.onGet('/api/account/settings/').reply(200, settings)
            return store
                .dispatch(
                    actions.fetchAccountSettings(
                        AccountSettingType.DefaultIntegration,
                    ),
                )
                .then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                })
        })

        it('should return the error.', () => {
            mockServer
                .onGet('/api/account/settings/')
                .reply(503, { message: 'error' })
            return store
                .dispatch(
                    actions.fetchAccountSettings(
                        AccountSettingType.DefaultIntegration,
                    ),
                )
                .then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                })
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
                        1: { display_order: 2 },
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
            const response = {
                scheduled_to_cancel_at: '2024-04-09T00:43:06+00:00',
            }

            mockServer
                .onPost('/api/billing/subscription/cancel/')
                .reply(201, response)

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
                .onPost('/api/billing/subscription/cancel/')
                .reply(400, { error: { msg: 'error', data: [] } })

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
                .onPost('/api/billing/subscription/cancel/')
                .reply(500, { random: 'Response' })

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

    describe('submitAgentTableConfigView', () => {
        it.each([
            [
                AccountSettingType.AgentsTableConfig,
                submitAgentTableConfigView,
                AgentsTableColumn.ClosedTickets,
            ],
            [
                AccountSettingType.AgentAvailabilityTableConfig,
                submitAgentAvailabilityTableConfigView,
                'agent_online_time',
            ],
            [
                AccountSettingType.ChannelsTableConfig,
                submitChannelsTableConfigView,
                ChannelsTableColumns.ClosedTickets,
            ],
            [
                AccountSettingType.ProductInsightsTableConfig,
                submitProductInsightsTableConfigView,
                ProductInsightsTableColumns.PositiveSentiment,
            ],
        ])(
            'should submit new TableConfig if none present in the state ',
            async (tableConfigType, submitAction, metric) => {
                const data = { hello: 'world' }
                mockServer.onPost('/api/account/settings/').reply(200, data)
                store = mockStore({
                    currentAccount: initialState,
                    billing: fromJS(billingState),
                })
                const metrics = [
                    {
                        id: metric,
                        visibility: true,
                    },
                ]
                const activeView = {
                    id: 'some-id',
                    metrics,
                    name: 'Some name',
                } as any

                await store.dispatch(submitAction(activeView))

                expect(mockServer.history.post[0].data).toEqual(
                    JSON.stringify({
                        type: tableConfigType,
                        data: {
                            active_view: activeView.id,
                            views: [activeView],
                        },
                    }),
                )
            },
        )

        it.each([
            [
                AccountSettingType.AgentsTableConfig,
                submitAgentTableConfigView,
                AgentsTableColumn.ClosedTickets,
                AgentsTableColumn.MessagesSentPerHour,
            ],
            [
                AccountSettingType.AgentAvailabilityTableConfig,
                submitAgentAvailabilityTableConfigView,
                'agent_online_time',
                'agent_name',
            ],
            [
                AccountSettingType.ChannelsTableConfig,
                submitChannelsTableConfigView,
                ChannelsTableColumns.ClosedTickets,
                ChannelsTableColumns.TicketHandleTime,
            ],
            [
                AccountSettingType.ProductInsightsTableConfig,
                submitProductInsightsTableConfigView,
                ProductInsightsTableColumns.PositiveSentiment,
                ProductInsightsTableColumns.NegativeSentiment,
            ],
        ])(
            'should submit updated TableConfig from state ',
            async (tableConfigType, submitAction, metric, newMetric) => {
                const data = { hello: 'world' }
                mockServer.onPost('/api/account/settings/').reply(200, data)
                const settingId = 'setting-id'
                const activeViewId = 'view-id'
                const metrics = [
                    {
                        id: metric,
                        visibility: true,
                    },
                ]
                const activeView = {
                    id: activeViewId,
                    name: 'Some name',
                    metrics,
                } as any
                store = mockStore({
                    currentAccount: fromJS({
                        settings: [
                            {
                                id: settingId,
                                type: tableConfigType,
                                data: {
                                    active_view: activeViewId,
                                    views: [activeView],
                                },
                            },
                        ],
                        _internal: {
                            loading: {},
                        },
                    }),
                    billing: fromJS(billingState),
                })

                const updatedMetrics = [
                    {
                        id: metric,
                        visibility: true,
                    },
                    {
                        id: newMetric,
                        visibility: true,
                    },
                ]
                const updatedView = {
                    ...activeView,
                    name: 'New name',
                    metrics: updatedMetrics,
                }

                await store.dispatch(submitAction(updatedView))

                expect(mockServer.history.put[0].data).toEqual(
                    JSON.stringify({
                        id: settingId,
                        type: tableConfigType,
                        data: {
                            active_view: activeView.id,
                            views: [updatedView],
                        },
                    }),
                )
            },
        )
    })
})
