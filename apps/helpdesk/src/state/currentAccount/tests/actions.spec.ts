import client from '@repo/api-resources'
import { assumeMock } from '@repo/testing'
import MockAdapter from 'axios-mock-adapter'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toast } from '@gorgias/axiom'

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
import { GorgiasApi } from 'services/gorgiasApi'
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

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        warning: jest.fn(),
        info: jest.fn(),
    },
}))
const toastSuccessMock = assumeMock(toast.success)
const toastErrorMock = assumeMock(toast.error)
const toastWarningMock = assumeMock(toast.warning)
const toastInfoMock = assumeMock(toast.info)

beforeEach(() => {
    toastSuccessMock.mockReset()
    toastErrorMock.mockReset()
    toastWarningMock.mockReset()
    toastInfoMock.mockReset()
})

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

    it('shows a success toast when updating account', () => {
        const data = { id: 2 }

        mockServer.onPut('/api/account/').reply(200, data)

        return store.dispatch(actions.updateAccount(data as any)).then(() => {
            expect(toastSuccessMock).toHaveBeenCalledWith(
                'Account settings successfully updated!',
            )
        })
    })

    describe('submit setting', () => {
        it('creation', () => {
            const data = { hello: 'world' }

            mockServer.onPost('/api/account/settings/').reply(200, data)

            return store
                .dispatch(actions.submitSetting(data as any))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('shows a success toast when creating a setting', () => {
            const data = {
                type: AccountSettingType.DefaultIntegration,
                data: {},
            }

            mockServer.onPost('/api/account/settings/').reply(200, data)

            return store
                .dispatch(actions.submitSetting(data as any))
                .then(() => {
                    expect(toastSuccessMock).toHaveBeenCalledWith(
                        'Default-integration settings saved',
                    )
                })
        })

        it('update', () => {
            const data = { id: 1, hello: 'world' }

            mockServer.onPut('/api/account/settings/1/').reply(200, data)

            return store
                .dispatch(actions.submitSetting(data as any))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('uses the provided success toast message when updating a setting', () => {
            const data = {
                id: 1,
                type: AccountSettingType.DefaultIntegration,
                data: {},
            }

            mockServer.onPut('/api/account/settings/1/').reply(200, data)

            return store
                .dispatch(actions.submitSetting(data as any, 'Setting saved'))
                .then(() => {
                    expect(toastSuccessMock).toHaveBeenCalledWith(
                        'Setting saved',
                    )
                })
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

        it('shows a success toast when updating the account owner', () => {
            const userId = 1

            mockServer.onPut('/api/account/owner/', { id: userId }).reply(202)

            return store
                .dispatch(actions.updateAccountOwner(userId))
                .then(() => {
                    expect(toastSuccessMock).toHaveBeenCalledWith(
                        'The account owner was successfully changed.',
                    )
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
                    expect(toastSuccessMock).toHaveBeenCalledWith(
                        'Your subscription was updated.',
                    ),
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
                    actions.updateSubscriptionsForPlans({
                        products: {
                            helpdesk: basicMonthlyHelpdeskPlan.plan_id,
                        },
                        notifications: [],
                    }),
                )
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('sends subscription_resource_version and subscription_renewal_ramp_resource_version on PUT when provided', async () => {
            mockServer
                .onPut('/api/billing/subscription/')
                .reply(202, { products: {} })

            await store.dispatch(
                actions.updateSubscriptionsForPlans({
                    products: { helpdesk: basicMonthlyHelpdeskPlan.plan_id },
                    notifications: [],
                    subscriptionResourceVersion: 12345,
                    subscriptionRenewalRampResourceVersion: 67890,
                }),
            )

            expect(mockServer.history.put).toHaveLength(1)
            expect(JSON.parse(mockServer.history.put[0].data)).toEqual({
                prices: [basicMonthlyHelpdeskPlan.plan_id],
                subscription_resource_version: 12345,
                subscription_renewal_ramp_resource_version: 67890,
            })
        })

        it('omits version fields from PUT body when resource versions are not provided', async () => {
            mockServer
                .onPut('/api/billing/subscription/')
                .reply(202, { products: {} })

            await store.dispatch(
                actions.updateSubscriptionsForPlans({
                    products: { helpdesk: basicMonthlyHelpdeskPlan.plan_id },
                    notifications: [],
                }),
            )

            expect(mockServer.history.put).toHaveLength(1)
            expect(JSON.parse(mockServer.history.put[0].data)).toEqual({
                prices: [basicMonthlyHelpdeskPlan.plan_id],
            })
        })

        it('resolves with response payload including refreshed version fields', async () => {
            const responseBody = {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                },
                subscription_resource_version: 99,
                subscription_renewal_ramp_version: 7,
            }
            mockServer
                .onPut('/api/billing/subscription/')
                .reply(202, responseBody)

            const result = await store.dispatch(
                actions.updateSubscriptionsForPlans({
                    products: { helpdesk: basicMonthlyHelpdeskPlan.plan_id },
                    notifications: [],
                }),
            )

            expect(result).toEqual(responseBody)
        })

        it('shows toast notifications for subscription update notifications', async () => {
            mockServer
                .onPut('/api/billing/subscription/')
                .reply(202, { products: {} })

            await store.dispatch(
                actions.updateSubscriptionsForPlans({
                    products: { helpdesk: basicMonthlyHelpdeskPlan.plan_id },
                    notifications: [
                        {
                            status: NotificationStatus.Error,
                            message: 'Error notification',
                        },
                        {
                            status: NotificationStatus.Warning,
                            message: 'Warning notification',
                        },
                        {
                            status: NotificationStatus.Success,
                            message: 'Success notification',
                        },
                        {
                            message: 'Info notification',
                        },
                        {} as any,
                    ],
                }),
            )

            expect(toastErrorMock).toHaveBeenCalledWith('Error notification')
            expect(toastWarningMock).toHaveBeenCalledWith(
                'Warning notification',
            )
            expect(toastSuccessMock).toHaveBeenCalledWith(
                'Success notification',
            )
            expect(toastInfoMock).toHaveBeenNthCalledWith(
                1,
                'Info notification',
            )
            expect(toastInfoMock).toHaveBeenNthCalledWith(2, '')
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

    describe('resendVerificationEmail()', () => {
        const resendAccountVerificationEmailMock = jest.spyOn(
            GorgiasApi.prototype,
            'resendAccountVerificationEmail',
        )

        afterEach(() => {
            resendAccountVerificationEmailMock.mockReset()
        })

        it('shows a success toast when the verification email is resent', async () => {
            resendAccountVerificationEmailMock.mockResolvedValue(undefined)

            await store.dispatch(actions.resendVerificationEmail())

            expect(toastSuccessMock).toHaveBeenCalledWith(
                'The verification email has been resent!',
            )
        })

        it('shows an error toast when the verification email cannot be resent', async () => {
            resendAccountVerificationEmailMock.mockRejectedValue({
                response: {
                    data: {
                        error: {
                            msg: 'Unable to resend verification email',
                        },
                    },
                },
            })

            await store.dispatch(actions.resendVerificationEmail())

            expect(toastErrorMock).toHaveBeenCalledWith(
                'Unable to resend verification email',
            )
        })

        it('falls back to an empty error toast when the error has no message', async () => {
            resendAccountVerificationEmailMock.mockRejectedValue({})

            await store.dispatch(actions.resendVerificationEmail())

            expect(toastErrorMock).toHaveBeenCalledWith('')
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
                    expect(toastSuccessMock).toHaveBeenCalledWith(
                        'Your Helpdesk auto-renewal has been cancelled.',
                    )
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
                    expect(toastErrorMock).toHaveBeenCalledWith('error')
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
                    expect(toastErrorMock).toHaveBeenCalledWith(
                        'Failed to cancel Helpdesk auto-renewal. If the problem persists, please contact our billing team via chat or at support@gorgias.com to make this change.',
                    )
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
