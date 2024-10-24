import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'
import {renderHookWithQueryClientProvider} from 'tests/reactQueryTestingUtils'

import {useCreditCard} from '../queries'

const mockedServer = new MockAdapter(client)

describe('getCreditCard', () => {
    it('should return correct data on success', async () => {
        const card = {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2026,
        }

        mockedServer.onGet('/api/billing/credit-card/').reply(200, card)

        const {result, waitFor} =
            renderHookWithQueryClientProvider(useCreditCard)

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.data).toStrictEqual(card)
    })

    it('should return expected error on failure', async () => {
        mockedServer
            .onGet('/api/billing/credit-card/')
            .reply(503, {message: 'error'})

        const {result, waitFor} =
            renderHookWithQueryClientProvider(useCreditCard)

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toEqual(
            new Error('Request failed with status code 503')
        )
    })
})
