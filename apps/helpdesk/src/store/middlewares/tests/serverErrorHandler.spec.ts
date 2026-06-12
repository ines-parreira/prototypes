import { waitFor } from '@testing-library/react'
import _get from 'lodash/get'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { serverErrorHandler } from '../serverErrorHandler'

const middlewares = [thunk, serverErrorHandler]
const mockStore = configureMockStore(middlewares)

const types = {
    upsertNotification: 'reapop/upsertNotification',
}

function removeWhitespace(str = '') {
    return str.replace(/\s/g, '')
}

describe('middlewares', () => {
    describe('serverErrorHandler', () => {
        let store: MockStoreEnhanced<unknown>

        beforeEach(() => {
            store = mockStore()
        })

        it('should add notification with default title', () => {
            const actionType = 'ERROR_ACTION'
            const notificationTitle = `Unknown error for action ${actionType}`
            const errorAction = {
                error: {},
                type: actionType,
            }
            store.dispatch(errorAction)

            expect(store.getActions()[0]).toMatchObject({
                payload: {
                    message: notificationTitle,
                },
                type: types.upsertNotification,
            })
        })

        it('should add notification with title', () => {
            const notificationTitle = 'Pizza pepperoni'
            const errorAction = {
                error: {
                    response: {
                        data: {
                            error: {
                                msg: notificationTitle,
                            },
                        },
                    },
                },
                type: '',
            }
            store.dispatch(errorAction)

            expect(store.getActions()[0]).toMatchObject({
                payload: {
                    message: notificationTitle,
                },
                type: types.upsertNotification,
            })
        })

        it('should not add notification content if not verbose', () => {
            const notificationTitle = 'Pizza pepperoni'
            const notificationContent = {
                hello: ['world'],
            }
            const errorAction = {
                error: {
                    response: {
                        data: {
                            error: {
                                msg: notificationTitle,
                                data: notificationContent,
                            },
                        },
                    },
                },
                type: '',
            }
            store.dispatch(errorAction)

            expect(store.getActions()[0]).toMatchObject({
                payload: {
                    message: notificationTitle,
                },
                type: types.upsertNotification,
            })
        })

        it('should add notification with title and content', () => {
            const notificationTitle = 'Pizza pepperoni'
            const notificationContent = {
                hello: ['world'],
                receiver: ['Missing data', 'Invalid value'],
            }
            const errorAction = {
                verbose: true,
                error: {
                    response: {
                        data: {
                            error: {
                                msg: notificationTitle,
                                data: notificationContent,
                            },
                        },
                    },
                },
                type: '',
            }
            store.dispatch(errorAction)

            const payload = Object.assign(
                {},
                _get(store.getActions(), [0, 'payload']),
                {
                    message: removeWhitespace(
                        _get(store.getActions(), [0, 'payload', 'message']),
                    ),
                },
            )

            expect(payload).toMatchObject({
                title: notificationTitle,
                message: removeWhitespace(`
                    <ul className="m-0">
                        <li>Hello: world</li>
                        <li>Receiver: Missing data</li>
                        <li>Receiver: Invalid value</li>
                    </ul>
                `),
            })
        })

        it('should append message about redirection for 419 HTTP errors', () => {
            const notificationTitle = 'Your session has expired.'
            const errorAction = {
                error: {
                    response: {
                        data: {
                            error: {
                                msg: notificationTitle,
                            },
                        },
                        status: 419,
                    },
                },
                type: 'error',
            }
            store.dispatch(errorAction)

            expect(store.getActions()[0]).toMatchObject({
                payload: {
                    message: `${notificationTitle} You will be redirected to the login page in a few seconds.`,
                },
                type: types.upsertNotification,
            })
        })

        it('should not append message about redirection for 419 HTTP errors when error message already has a message about redirection', () => {
            const notificationTitle =
                'Your session has expired. You will be redirected to the login page in a few seconds.'
            const errorAction = {
                error: {
                    response: {
                        data: {
                            error: {
                                msg: notificationTitle,
                            },
                        },
                        status: 419,
                    },
                },
                type: 'error',
            }
            store.dispatch(errorAction)

            expect(store.getActions()[0]).toMatchObject({
                payload: {
                    message: notificationTitle,
                },
                type: types.upsertNotification,
            })
        })

        describe('Integration limit reached', () => {
            const originalHref = window.location.href

            beforeEach(() => {
                Object.defineProperty(window, 'location', {
                    configurable: true,
                    enumerable: true,
                    value: new URL(originalHref),
                })
            })

            const buildLimitReachedAction = (
                limit: number,
                current: number,
                upgradable: boolean = true,
            ) => ({
                error: {
                    isAxiosError: true,
                    response: {
                        status: 422,
                        data: {
                            error: {
                                msg: `You've reached your plan's limit of ${limit} channels.`,
                                data: {
                                    error_code: 'integration_limit_reached',
                                    limit,
                                    current,
                                    upgradable,
                                },
                            },
                        },
                    },
                },
                type: 'CREATE_INTEGRATION_ERROR',
            })

            it('should dispatch an upgrade notification when the merchant can self-serve', () => {
                store.dispatch(buildLimitReachedAction(25, 25, true))

                const payload = _get(store.getActions(), [0, 'payload'])
                expect(payload).toMatchObject({
                    title: "You've reached your plan's limit of 25 channels.",
                    message: 'Upgrade your plan to add more channels.',
                    buttons: [
                        expect.objectContaining({ name: 'Upgrade plan' }),
                    ],
                })
            })

            it('should dispatch a CSM-contact notification when the merchant is on a non-upgradable plan', () => {
                store.dispatch(buildLimitReachedAction(50, 50, false))

                const payload = _get(store.getActions(), [0, 'payload'])
                expect(payload).toMatchObject({
                    title: "You've reached your plan's limit of 50 channels.",
                    message:
                        'Reach out to your Customer Success Manager to raise your limit.',
                    buttons: [expect.objectContaining({ name: 'Contact us' })],
                })
            })

            it('button onClick navigates to billing', () => {
                const assignSpy = jest.fn()
                Object.defineProperty(window.location, 'assign', {
                    configurable: true,
                    value: assignSpy,
                })

                store.dispatch(buildLimitReachedAction(10, 12, true))

                const buttons = _get(store.getActions(), [
                    0,
                    'payload',
                    'buttons',
                ]) as Array<{
                    name: string
                    primary?: boolean
                    onClick?: () => void
                }>

                expect(buttons).toHaveLength(1)
                buttons[0].onClick?.()
                expect(assignSpy).toHaveBeenCalledWith('/app/settings/billing')
            })

            it('should not also dispatch the generic error toast', () => {
                store.dispatch(buildLimitReachedAction(5, 5))
                // Exactly one notification is dispatched — the specialized one.
                // The original action is still forwarded via next(), so total
                // dispatched action count is 2, but only one is a notification.
                const notifications = store
                    .getActions()
                    .filter((a) => a.type === types.upsertNotification)
                expect(notifications).toHaveLength(1)
            })
        })

        describe('Login redirect', () => {
            const originalHref = window.location.href
            const errorAction = {
                error: {
                    response: {
                        data: {},
                        status: 401,
                    },
                },
                type: 'error',
            }

            beforeEach(() => {
                Object.defineProperty(window, 'location', {
                    configurable: true,
                    enumerable: true,
                    value: new URL(originalHref),
                })

                jest.useFakeTimers()
            })

            it('should redirect to the login page on 401 after 3 seconds', async () => {
                store.dispatch(errorAction)
                expect(window.location.href).not.toContain('/login')

                jest.advanceTimersByTime(3000)

                await waitFor(() => {
                    expect(window.location.href).toContain('/login')
                })
            })

            it('should include the current path as next parameter when redirecting to login', async () => {
                Object.defineProperty(window, 'location', {
                    configurable: true,
                    enumerable: true,
                    value: new URL(
                        'https://example.gorgias.com/app/views/123/456',
                    ),
                })

                store.dispatch(errorAction)
                jest.advanceTimersByTime(3000)

                await waitFor(() => {
                    expect(window.location.href).toBe(
                        'https://example.gorgias.com/login?next=%2Fapp%2Fviews%2F123%2F456',
                    )
                })
            })
        })
    })
})
