import type { UpsertNotificationAction } from 'reapop/dist/reducers/notifications/actions'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AlertBannerTypes } from 'AlertBanners'

import type { StoreDispatch } from '../../types'
import { handleUsageBanner, INITIAL_MESSAGE, notify } from '../actions'
import type { Notification } from '../types'

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares,
)
const types = {
    upsertNotification: 'reapop/upsertNotification',
    dismissNotification: 'reapop/dismissNotification',
}
const initialState = {
    notifications: [],
}

type MockedRootState = {
    notifications: Array<Notification>
}

describe('actions', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>

    beforeEach(() => {
        store = mockStore(initialState)
    })

    describe('notifications', () => {
        it('should not add empty notifications', async () => {
            await store.dispatch(notify())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([])
        })

        it('should add a default notification', async () => {
            await store.dispatch(notify({}))
            const expectedActions = store.getActions()
            const defaultMessage = Object.assign(
                {},
                INITIAL_MESSAGE as Notification,
            )

            expect(expectedActions).toMatchObject([
                {
                    type: types.upsertNotification,
                    payload: defaultMessage,
                },
            ])
        })

        it('should calculate dismiss time when zero', async () => {
            await store.dispatch(
                notify({
                    dismissAfter: 0,
                }),
            )
            const expectedActions = store.getActions()

            expect(expectedActions).not.toMatchObject([
                {
                    payload: {
                        dismissAfter: 0,
                    },
                },
            ])
        })

        it('should calculate dismiss time depending on content', async () => {
            await store.dispatch(
                notify({
                    title: 'Pizza is a yeasted flatbread typically topped with tomato sauce and cheese and baked in an oven.',
                    message:
                        'It is commonly topped with a selection of meats, vegetables and condiments.',
                }),
            )
            const expectedActions = store.getActions()

            expect(expectedActions).toMatchObject([
                {
                    payload: {
                        dismissAfter: 8000,
                    },
                },
            ])
        })

        it('should not calculate dismiss time when not dismissible', async () => {
            await store.dispatch(
                notify({
                    dismissAfter: 0,
                    dismissible: false,
                }),
            )
            const expectedActions = store.getActions()

            expect(expectedActions).toMatchObject([
                {
                    payload: {
                        dismissAfter: 0,
                    },
                },
            ])
        })

        it('should set `dismissAfter` to 0 when `noAutoDismiss` is true', async () => {
            await store.dispatch(
                notify({
                    dismissAfter: 5000,
                    noAutoDismiss: true,
                }),
            )
            const expectedActions = store.getActions()

            expect(expectedActions).toMatchObject([
                {
                    payload: {
                        dismissAfter: 0,
                    },
                },
            ])
        })

        it('should set title as content, if content not defined', async () => {
            const title =
                'Pizza is a yeasted flatbread typically topped with tomato sauce and cheese and baked in an oven.'
            await store.dispatch(notify({ title }))
            const expectedActions = store.getActions()

            expect(expectedActions).toMatchObject([
                {
                    payload: {
                        message: title,
                    },
                },
            ])
        })

        it('should not add duplicate notifications', async () => {
            const notification = (await store.dispatch(
                notify({
                    id: '12345',
                    message: 'Prosciutto e Funghi',
                    dismissAfter: 1,
                }),
            )) as UpsertNotificationAction

            store = mockStore({
                notifications: [notification.payload as Notification],
            })

            await store.dispatch(notify(notification.payload as Notification))
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([])
        })

        it('should close previous notifications with closeOnNext', async () => {
            const notification = (await store.dispatch(
                notify({
                    message: 'Prosciutto e Funghi',
                    dismissAfter: 1,
                    closeOnNext: true,
                }),
            )) as UpsertNotificationAction

            store = mockStore({
                notifications: [notification.payload as Notification],
            })

            await store.dispatch(notify(notification.payload as Notification))
            const expectedActions = store.getActions()

            expect(expectedActions).toMatchObject([
                {
                    type: types.dismissNotification,
                    payload: notification.payload.id,
                },
            ])
        })
    })
    describe('handleUsageBanner', () => {
        it('should hide the banner if the status has changed', () => {
            store.dispatch(
                handleUsageBanner({
                    newAccountStatus: 'active',
                    currentAccountStatus: 'deactivated',
                    notification: undefined,
                }),
            )
            const expectedActions = store.getActions()
            expect(expectedActions).toMatchSnapshot()
        })

        it('should not do anything if no notification and status has not changed', () => {
            store.dispatch(
                handleUsageBanner({
                    newAccountStatus: 'active',
                    currentAccountStatus: 'active',
                    notification: undefined,
                }),
            )
            const expectedActions = store.getActions()
            expect(expectedActions).toMatchSnapshot()
        })

        it('should dispatch notify if there is a notification', () => {
            const messageNotification = 'new notification test'
            store.dispatch(
                handleUsageBanner({
                    newAccountStatus: 'active',
                    currentAccountStatus: 'active',
                    notification: {
                        id: 'ok',
                        type: AlertBannerTypes.Critical,
                        message: messageNotification,
                    },
                }),
            )
            const expectedActions = store.getActions()
            expect(expectedActions).toMatchSnapshot()
        })

        it('should hide and dispatch notify if there is a notification and status change', () => {
            const messageNotification = 'new notification test'
            store.dispatch(
                handleUsageBanner({
                    newAccountStatus: 'active',
                    currentAccountStatus: 'deactivated',
                    notification: {
                        id: 'ok',
                        type: AlertBannerTypes.Info,
                        message: messageNotification,
                    },
                }),
            )
            const expectedActions = store.getActions()
            expect(expectedActions).toMatchSnapshot()
        })

        it('should use default CTA when notification.CTA is not provided', () => {
            const messageNotification = 'Account usage notification'
            store.dispatch(
                handleUsageBanner({
                    newAccountStatus: 'active',
                    currentAccountStatus: 'active',
                    notification: {
                        id: 'usage-banner',
                        type: AlertBannerTypes.Warning,
                        message: messageNotification,
                    },
                }),
            )
            const expectedActions = store.getActions()
            expect(expectedActions).toMatchObject([
                {
                    type: types.upsertNotification,
                    payload: expect.objectContaining({
                        CTA: {
                            type: 'internal',
                            text: 'Go to billing page',
                            to: '/app/settings/billing',
                        },
                    }),
                },
            ])
        })

        it('should use notification.CTA when provided', () => {
            const messageNotification = 'Custom notification with CTA'
            const customCTA = {
                type: 'internal' as const,
                text: 'View Details',
                to: '/app/settings/account',
            }
            store.dispatch(
                handleUsageBanner({
                    newAccountStatus: 'active',
                    currentAccountStatus: 'active',
                    notification: {
                        id: 'custom-banner',
                        type: AlertBannerTypes.Warning,
                        message: messageNotification,
                        CTA: customCTA,
                    },
                }),
            )
            const expectedActions = store.getActions()
            expect(expectedActions).toMatchObject([
                {
                    type: types.upsertNotification,
                    payload: expect.objectContaining({
                        CTA: customCTA,
                    }),
                },
            ])
        })

        it('should use external CTA when provided from notification', () => {
            const messageNotification = 'External link notification'
            const externalCTA = {
                type: 'external' as const,
                text: 'Learn More',
                href: 'https://example.com/help',
                opensInNewTab: true,
            }
            store.dispatch(
                handleUsageBanner({
                    newAccountStatus: 'active',
                    currentAccountStatus: 'active',
                    notification: {
                        id: 'external-banner',
                        type: AlertBannerTypes.Info,
                        message: messageNotification,
                        CTA: externalCTA,
                    },
                }),
            )
            const expectedActions = store.getActions()
            expect(expectedActions).toMatchObject([
                {
                    type: types.upsertNotification,
                    payload: expect.objectContaining({
                        CTA: externalCTA,
                    }),
                },
            ])
        })
    })
})
