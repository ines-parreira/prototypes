import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { useHistory } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toast } from '@gorgias/axiom'

import { GorgiasApi } from 'services/gorgiasApi'
import { setCurrentSubscription } from 'state/currentAccount/actions'
import * as selectors from 'state/currentAccount/selectors'

import { useStartSubscription } from '../useStartSubscription'

jest.useFakeTimers()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('services/gorgiasApi')

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const renderHookWithMockStore = <TProps, TResult>(
    callback: (props: TProps) => TResult,
) => {
    const store = mockStore({})
    const wrapper = ({ children }: any) => (
        <Provider store={store}>{children}</Provider>
    )

    const result = renderHook(callback, { wrapper })

    return { ...result, store }
}

const mockGetIsCurrentSubscriptionTrialingOrCanceled = (value: boolean) =>
    jest
        .spyOn(selectors, 'getIsCurrentSubscriptionTrialingOrCanceled')
        .mockReturnValue(value)

let gorgiasApiInstance: {
    startSubscription: jest.Mock
}

const startSubscription = async (
    response = {},
    error?: Record<string, any>,
) => {
    if (error) {
        gorgiasApiInstance.startSubscription.mockRejectedValue(error)
    } else {
        gorgiasApiInstance.startSubscription.mockResolvedValue(fromJS(response))
    }

    const { result, store } = renderHookWithMockStore(useStartSubscription)

    await act(async () => {
        // start subscription
        await result.current()
    })

    return {
        store,
    }
}

describe('useStartSubscription', () => {
    beforeEach(() => {
        gorgiasApiInstance = {
            startSubscription: jest.fn(),
        }
        ;(GorgiasApi as unknown as jest.Mock).mockImplementation(
            () => gorgiasApiInstance,
        )

        assumeMock(useHistory).mockReturnValue({ push: jest.fn() } as any)
    })

    afterEach(() => {
        toast.dismiss()
    })

    describe('if subscription IS NOT trialing or canceled', () => {
        beforeEach(() => {
            mockGetIsCurrentSubscriptionTrialingOrCanceled(false)
        })

        it('should do nothing ', async () => {
            await startSubscription()

            expect(gorgiasApiInstance.startSubscription).not.toHaveBeenCalled()
        })
    })

    describe('if subscription IS trialing or canceled', () => {
        beforeEach(() => {
            mockGetIsCurrentSubscriptionTrialingOrCanceled(true)
        })

        it('should start subscription and handle confirmation_url', async () => {
            const { store } = await startSubscription({
                subscription: {},
                payment: { confirmation_url: 'https://example.com' },
            })

            expect(gorgiasApiInstance.startSubscription).toHaveBeenCalled()

            expect(store.getActions()).toContainEqual(
                setCurrentSubscription(fromJS({})),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name:
                            'In order to activate your subscription, we need you to confirm this payment to your bank. ' +
                            'You will be redirected in a few seconds to a secure page.',
                    }),
                ).toHaveAttribute('data-intent', 'info')
            })

            jest.runAllTimers()

            expect(useHistory().push).toHaveBeenCalledWith(
                'https://example.com',
            )
        })

        it('should start subscription and handle payment error', async () => {
            await startSubscription({
                subscription: {},
                payment: { error: 'Payment failed' },
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Payment failed Please update your payment method and retry to pay your invoice.',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })

        it('should handle generic API error', async () => {
            await startSubscription(
                {},
                {
                    response: { data: { error: { msg: 'API Error' } } },
                    isAxiosError: true,
                },
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('status', { name: 'API Error' }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })

        it('should handle unknown error', async () => {
            await startSubscription({}, new Error('Unknown error'))

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Failed to update payment method. Please try again in a few seconds.',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })
    })
})
