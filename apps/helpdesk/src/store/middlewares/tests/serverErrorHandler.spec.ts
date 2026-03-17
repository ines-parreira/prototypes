import { getLDClient } from '@repo/feature-flags'
import { waitFor } from '@testing-library/react'
import { ldClientMock } from 'jest-launchdarkly-mock'
import _get from 'lodash/get'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import serverErrorHandler from '../serverErrorHandler'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    getLDClient: jest.fn(),
}))

const getLDClientMock = getLDClient as jest.Mock

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

            function setDocumentHidden(hidden: boolean): void {
                Object.defineProperty(document, 'hidden', {
                    value: hidden,
                    configurable: true,
                })
            }

            beforeEach(() => {
                Object.defineProperty(window, 'location', {
                    configurable: true,
                    enumerable: true,
                    value: new URL(originalHref),
                })

                jest.useFakeTimers()
                getLDClientMock.mockReset()
            })

            it('should redirect to the login page on 401 after 3 seconds', () => {
                ldClientMock.variation.mockReturnValue(false)
                getLDClientMock.mockReturnValue(ldClientMock)

                store.dispatch(errorAction)
                expect(window.location.href).not.toContain('/login')

                jest.advanceTimersByTime(3000)
                expect(window.location.href).toContain('/login')
            })

            it('should include the current path as next parameter when redirecting to login', () => {
                ldClientMock.variation.mockReturnValue(false)
                getLDClientMock.mockReturnValue(ldClientMock)

                Object.defineProperty(window, 'location', {
                    configurable: true,
                    enumerable: true,
                    value: new URL(
                        'https://example.gorgias.com/app/views/123/456',
                    ),
                })

                store.dispatch(errorAction)
                jest.advanceTimersByTime(3000)

                expect(window.location.href).toBe(
                    'https://example.gorgias.com/login?next=%2Fapp%2Fviews%2F123%2F456',
                )
            })

            it('should wait for the tab to be active to redirect when the feature flag is enabled', async () => {
                ldClientMock.variation.mockReturnValue(true)
                getLDClientMock.mockReturnValue(ldClientMock)
                setDocumentHidden(true)

                Object.defineProperty(window, 'location', {
                    configurable: true,
                    enumerable: true,
                    value: new URL('https://example.gorgias.com/app/settings'),
                })

                store.dispatch(errorAction)
                expect(window.location.href).not.toContain('/login')

                jest.advanceTimersByTime(3000)
                expect(window.location.href).not.toContain('/login')

                setDocumentHidden(false)
                document.dispatchEvent(new Event('visibilitychange'))

                await waitFor(() => {
                    expect(window.location.href).toBe(
                        'https://example.gorgias.com/login?next=%2Fapp%2Fsettings',
                    )
                })
            })
        })
    })
})
