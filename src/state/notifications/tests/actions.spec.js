import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {INITIAL_MESSAGE, notify, handleUsageBanner} from '../actions.ts'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const types = {
    addNotification: 'ADD_NOTIFICATION',
    removeNotification: 'REMOVE_NOTIFICATION',
}
const initialState = {
    notifications: [],
}

describe('actions', () => {
    let store

    beforeEach(() => {
        store = mockStore(initialState)
    })

    describe('notifications', () => {
        it('should not add empty notifications', () => {
            store.dispatch(notify())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([])
        })

        it('should add a default notification', () => {
            store.dispatch(notify({}))
            const expectedActions = store.getActions()
            const defaultMessage = Object.assign({}, INITIAL_MESSAGE)
            // auto-calculated by default
            delete defaultMessage.dismissAfter

            expect(expectedActions).toMatchObject([
                {
                    type: types.addNotification,
                    payload: defaultMessage,
                },
            ])
        })

        it('should calculate dismiss time when zero', () => {
            store.dispatch(
                notify({
                    dismissAfter: 0,
                })
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

        it('should calculate dismiss time depending on content', () => {
            store.dispatch(
                notify({
                    title: 'Pizza is a yeasted flatbread typically topped with tomato sauce and cheese and baked in an oven.',
                    message:
                        'It is commonly topped with a selection of meats, vegetables and condiments.',
                })
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

        it('should not calculate dismiss time when not dismissible', () => {
            store.dispatch(
                notify({
                    dismissAfter: 0,
                    dismissible: false,
                })
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

        it('should set `dismissAfter` to 0 when `noAutoDismiss` is true', () => {
            store.dispatch(
                notify({
                    dismissAfter: 5000,
                    noAutoDismiss: true,
                })
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

        it('should set title as content, if content not defined', () => {
            const title =
                'Pizza is a yeasted flatbread typically topped with tomato sauce and cheese and baked in an oven.'
            store.dispatch(notify({title}))
            const expectedActions = store.getActions()

            expect(expectedActions).toMatchObject([
                {
                    payload: {
                        message: title,
                    },
                },
            ])
        })

        it('should not add duplicate notifications', () => {
            const notification = store.dispatch(
                notify({
                    id: 12345,
                    message: 'Prosciutto e Funghi',
                    dismissAfter: 1,
                })
            )

            store = mockStore({
                notifications: [notification],
            })

            store.dispatch(notify(notification))
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([])
        })

        it('should close previous notifications with closeOnNext', () => {
            const notification = store.dispatch(
                notify({
                    message: 'Prosciutto e Funghi',
                    dismissAfter: 1,
                    closeOnNext: true,
                })
            )

            store = mockStore({
                notifications: [notification],
            })

            store.dispatch(notify(notification))
            const expectedActions = store.getActions()

            expect(expectedActions).toMatchObject([
                {
                    type: types.removeNotification,
                    payload: notification.id,
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
                    dispatch: store.dispatch,
                })
            )
            const expectedActions = store.getActions()
            expect(expectedActions).toMatchSnapshot()
        })

        it('should not do anything if no notification and status has not changed', () => {
            store.dispatch(
                handleUsageBanner({
                    newAccountStatus: 'active',
                    currentAccountStatus: 'active',
                    dispatch: store.dispatch,
                })
            )
            const expectedActions = store.getActions()
            expect(expectedActions).toMatchSnapshot()
        })

        it('should dispatch notify if there is a notification', () => {
            const messageNotification = 'new notification test'
            const statusNotification = 'success'
            store.dispatch(
                handleUsageBanner({
                    newAccountStatus: 'active',
                    currentAccountStatus: 'active',
                    dispatch: store.dispatch,
                    notification: {
                        status: statusNotification,
                        message: messageNotification,
                    },
                })
            )
            const expectedActions = store.getActions()
            expect(expectedActions).toMatchSnapshot()
        })

        it('should hide and dispatch notify if there is a notification and status change', () => {
            const messageNotification = 'new notification test'
            const statusNotification = 'success'
            store.dispatch(
                handleUsageBanner({
                    newAccountStatus: 'active',
                    currentAccountStatus: 'deactivated',
                    dispatch: store.dispatch,
                    notification: {
                        status: statusNotification,
                        message: messageNotification,
                    },
                })
            )
            const expectedActions = store.getActions()
            expect(expectedActions).toMatchSnapshot()
        })
    })
})
