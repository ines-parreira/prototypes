import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _get from 'lodash/get'

import serverErrorHandler from '../serverErrorHandler'

const middlewares = [thunk, serverErrorHandler]
const mockStore = configureMockStore(middlewares)

const types = {
    addNotification: 'ADD_NOTIFICATION',
    removeNotification: 'REMOVE_NOTIFICATION'
}

function removeWhitespace (str = '') {
    return str.replace(/\s/g,'')
}

describe('middlewares', () => {
    describe('serverErrorHandler', () => {
        let store

        beforeEach(() => {
            store = mockStore()
        })

        it('should add notification with default title', () => {
            const actionType = 'ERROR_ACTION'
            const notificationTitle = `Unknown error for action ${actionType}`
            const errorAction = {
                error: {},
                type: actionType
            }
            store.dispatch(errorAction)

            expect(store.getActions()[0]).toMatchObject({
                payload: {
                    message: notificationTitle
                },
                type: types.addNotification
            })
        })

        it('should add notification with title', () => {
            const notificationTitle = 'Pizza pepperoni'
            const errorAction = {
                error: {
                    response: {
                        data: {
                            error: {
                                msg: notificationTitle
                            }
                        }
                    }
                },
                type: ''
            }
            store.dispatch(errorAction)

            expect(store.getActions()[0]).toMatchObject({
                payload: {
                    message: notificationTitle
                },
                type: types.addNotification
            })
        })

        it('should not add notification content if not verbose', () => {
            const notificationTitle = 'Pizza pepperoni'
            const notificationContent = {
                hello: ['world']
            }
            const errorAction = {
                error: {
                    response: {
                        data: {
                            error: {
                                msg: notificationTitle,
                                data: notificationContent
                            }
                        }
                    }
                },
                type: ''
            }
            store.dispatch(errorAction)

            expect(store.getActions()[0]).toMatchObject({
                payload: {
                    message: notificationTitle
                },
                type: types.addNotification
            })
        })

        it('should add notification with title and content', () => {
            const notificationTitle = 'Pizza pepperoni'
            const notificationContent = {
                hello: ['world'], receiver: ['Missing data', 'Invalid value']
            }
            const errorAction = {
                verbose: true,
                error: {
                    response: {
                        data: {
                            error: {
                                msg: notificationTitle,
                                data: notificationContent
                            }
                        }
                    }
                },
                type: ''
            }
            store.dispatch(errorAction)

            const payload = Object.assign(
                {},
                _get(store.getActions(), [0, 'payload']),
                {
                    message: removeWhitespace(_get(store.getActions(), [0, 'payload', 'message']))
                }
            )

            expect(payload).toMatchObject({
                title: notificationTitle,
                message: removeWhitespace(`
                    <ul className="m-0">
                        <li>hello: world</li>
                        <li>receiver: Missing data</li>
                        <li>receiver: Invalid value</li>
                    </ul>
                `)
            })
        })
    })
})
