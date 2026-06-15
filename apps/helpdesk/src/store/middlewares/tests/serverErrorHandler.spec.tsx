import { act, render, userEvent } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import { serverErrorHandler } from '../serverErrorHandler'

Element.prototype.setPointerCapture = jest.fn()
Element.prototype.releasePointerCapture = jest.fn()

const renderWithServerErrorHandler = () =>
    render(<div />, {
        reduxMiddlewares: [serverErrorHandler],
    })

describe('middlewares', () => {
    describe('serverErrorHandler', () => {
        let store: ReturnType<typeof renderWithServerErrorHandler>['store']

        beforeEach(() => {
            store = renderWithServerErrorHandler().store
        })

        it('should show toast with default title', async () => {
            const actionType = 'ERROR_ACTION'
            store.dispatch({
                error: {},
                type: actionType,
            })

            await waitFor(() => {
                const toastEl = screen.getByRole('status', {
                    name: `Unknown error for action ${actionType}`,
                })
                expect(toastEl).toHaveAttribute('data-intent', 'destructive')
            })
        })

        it('should show toast with error message from response', async () => {
            store.dispatch({
                error: {
                    response: {
                        data: {
                            error: {
                                msg: 'Pizza pepperoni',
                            },
                        },
                    },
                },
                type: '',
            })

            await waitFor(() => {
                const toastEl = screen.getByRole('status', {
                    name: 'Pizza pepperoni',
                })
                expect(toastEl).toHaveAttribute('data-intent', 'destructive')
            })
        })

        it('should show toast with error message when verbose data is present', async () => {
            store.dispatch({
                error: {
                    response: {
                        data: {
                            error: {
                                msg: 'Pizza pepperoni',
                                data: {
                                    hello: ['world'],
                                },
                            },
                        },
                    },
                },
                type: '',
            })

            await waitFor(() => {
                const toastEl = screen.getByRole('status', {
                    name: 'Pizza pepperoni',
                })
                expect(toastEl).toHaveAttribute('data-intent', 'destructive')
            })
        })

        it('should append message about redirection for 419 HTTP errors', async () => {
            const notificationTitle = 'Your session has expired.'
            store.dispatch({
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
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: `${notificationTitle} You will be redirected to the login page in a few seconds.`,
                    }),
                ).toBeInTheDocument()
            })
        })

        it('should not append message about redirection for 419 HTTP errors when error message already has a message about redirection', async () => {
            const notificationTitle =
                'Your session has expired. You will be redirected to the login page in a few seconds.'
            store.dispatch({
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
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('status', { name: notificationTitle }),
                ).toBeInTheDocument()
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

            it('should show an upgrade toast when the merchant can self-serve', async () => {
                store.dispatch(buildLimitReachedAction(25, 25, true))

                await waitFor(() => {
                    const toastEl = screen.getByRole('status', {
                        name: "You've reached your plan's limit of 25 channels.",
                    })
                    expect(toastEl).toHaveAttribute(
                        'data-intent',
                        'destructive',
                    )
                    expect(toastEl).toHaveTextContent(
                        'Upgrade your plan to add more channels.',
                    )
                })

                expect(
                    screen.getByRole('button', { name: 'Upgrade plan' }),
                ).toBeInTheDocument()
            })

            it('should show a CSM-contact toast when the merchant is on a non-upgradable plan', async () => {
                store.dispatch(buildLimitReachedAction(50, 50, false))

                await waitFor(() => {
                    const toastEl = screen.getByRole('status', {
                        name: "You've reached your plan's limit of 50 channels.",
                    })
                    expect(toastEl).toHaveAttribute(
                        'data-intent',
                        'destructive',
                    )
                    expect(toastEl).toHaveTextContent(
                        'Reach out to your Customer Success Manager to raise your limit.',
                    )
                })

                expect(
                    screen.getByRole('button', { name: 'Contact us' }),
                ).toBeInTheDocument()
            })

            it('button click navigates to billing', async () => {
                const assignSpy = jest.fn()
                Object.defineProperty(window.location, 'assign', {
                    configurable: true,
                    value: assignSpy,
                })

                store.dispatch(buildLimitReachedAction(10, 12, true))

                const button = await screen.findByRole('button', {
                    name: 'Upgrade plan',
                })
                const user = userEvent.setup()
                await user.click(button)

                expect(assignSpy).toHaveBeenCalledWith('/app/settings/billing')
            })

            it('should not also show the generic error toast', async () => {
                store.dispatch(buildLimitReachedAction(5, 5))

                await waitFor(() => {
                    expect(screen.getAllByRole('status')).toHaveLength(1)
                })
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

            afterEach(() => {
                jest.useRealTimers()
            })

            it('should redirect to the login page on 401 after 3 seconds', () => {
                store.dispatch(errorAction)
                expect(window.location.href).not.toContain('/login')

                act(() => {
                    jest.advanceTimersByTime(3000)
                })

                expect(window.location.href).toContain('/login')
            })

            it('should include the current path as next parameter when redirecting to login', () => {
                Object.defineProperty(window, 'location', {
                    configurable: true,
                    enumerable: true,
                    value: new URL(
                        'https://example.gorgias.com/app/views/123/456',
                    ),
                })

                store.dispatch(errorAction)
                act(() => {
                    jest.advanceTimersByTime(3000)
                })

                expect(window.location.href).toBe(
                    'https://example.gorgias.com/login?next=%2Fapp%2Fviews%2F123%2F456',
                )
            })
        })
    })
})
