import React from 'react'

import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { useHistory } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import GorgiasApi from 'services/gorgiasApi'
import { setCurrentSubscription } from 'state/currentAccount/actions'
import * as selectors from 'state/currentAccount/selectors'
import * as actions from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'

import { useStartSubscription } from '../useStartSubscription'

jest.useFakeTimers()

jest.mock('react-router-dom', () => ({
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

    const notifySpy = jest.spyOn(actions, 'notify')

    const { result, store } = renderHookWithMockStore(useStartSubscription)

    await act(async () => {
        // start subscription
        await result.current()
    })

    return {
        store,
        notifySpy,
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
            const { store, notifySpy } = await startSubscription({
                subscription: {},
                payment: { confirmation_url: 'https://example.com' },
            })

            expect(gorgiasApiInstance.startSubscription).toHaveBeenCalled()

            expect(store.getActions()).toContainEqual(
                setCurrentSubscription(fromJS({})),
            )

            expect(notifySpy).toHaveBeenCalledWith({
                status: NotificationStatus.Info,
                message:
                    'In order to activate your subscription, we need you to confirm this payment to your bank. ' +
                    'You will be redirected in a few seconds to a secure page.',
                dismissAfter: 5000,
                dismissible: false,
            })

            jest.runAllTimers()

            expect(useHistory().push).toHaveBeenCalledWith(
                'https://example.com',
            )
        })

        it('should start subscription and handle payment error', async () => {
            const { notifySpy } = await startSubscription({
                subscription: {},
                payment: { error: 'Payment failed' },
            })

            expect(notifySpy).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message:
                    'Payment failed Please update your payment method and retry to pay your invoice.',
            })
        })

        it('should handle generic API error', async () => {
            const { notifySpy } = await startSubscription(
                {},
                {
                    response: { data: { error: { msg: 'API Error' } } },
                    isAxiosError: true,
                },
            )

            expect(notifySpy).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                title: 'API Error',
            })
        })

        it('should handle unknown error', async () => {
            const { notifySpy } = await startSubscription(
                {},
                new Error('Unknown error'),
            )

            expect(notifySpy).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                title: 'Failed to update payment method. Please try again in a few seconds.',
            })
        })
    })
})
