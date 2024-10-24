import {waitFor} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'
import {
    FETCH_CREDIT_CARD_ERROR,
    FETCH_CREDIT_CARD_SUCCESS,
} from 'state/billing/constants'
import {renderHookWithStoreAndQueryClientProvider} from 'tests/renderHookWithStoreAndQueryClientProvider'

import {useCreditCardWithSideEffects} from '../useCreditCardWithSideEffects'

const mockedServer = new MockAdapter(client)

describe('useCreditCardWithSideEffects', () => {
    it('should update redux state when credit card fetch is successful', async () => {
        const mockCreditCardData = {id: '1234', last4: '5678'}

        mockedServer
            .onGet('/api/billing/credit-card/')
            .reply(200, mockCreditCardData)

        const {store, result} = renderHookWithStoreAndQueryClientProvider(
            useCreditCardWithSideEffects
        )

        expect(result.current.isSuccess).toBe(false)
        expect(result.current.data).toBeUndefined()

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
            expect(result.current.data?.data).toEqual(mockCreditCardData)
        })

        await waitFor(() => {
            expect(store.getActions()).toEqual([
                {
                    type: FETCH_CREDIT_CARD_SUCCESS,
                    resp: mockCreditCardData,
                },
            ])
        })
    })

    it('should notify an error when credit card fetch fails', async () => {
        mockedServer.onGet('/api/billing/credit-card/').reply(500)

        const {store, waitFor, result} =
            renderHookWithStoreAndQueryClientProvider(
                useCreditCardWithSideEffects
            )

        expect(result.current.isError).toBe(false)
        expect(result.current.error).toBeNull()

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
            expect(result.current.error).not.toBeNull()
        })

        await waitFor(() => {
            expect(store.getActions()).toEqual([
                {
                    type: FETCH_CREDIT_CARD_ERROR,
                    error: result.current.error,
                    reason: 'Unable to get credit card information.',
                },
            ])
        })
    })
})
