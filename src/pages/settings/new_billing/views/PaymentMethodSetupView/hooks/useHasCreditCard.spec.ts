import MockAdapter from 'axios-mock-adapter'
import client from 'models/api/resources'
import {renderHookWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {useHasCreditCard} from './useHasCreditCard'

const mockedServer = new MockAdapter(client)

describe('useHasCreditCard', () => {
    it('should return true when credit card is present', async () => {
        const card = {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2026,
        }

        mockedServer.onGet('/api/billing/credit-card/').reply(200, card)

        const {result, waitFor} =
            renderHookWithQueryClientProvider(useHasCreditCard)

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toBe(true)
    })

    it('should return false when credit card is not present', async () => {
        mockedServer.onGet('/api/billing/credit-card/').reply(200, {})

        const {result, waitFor} =
            renderHookWithQueryClientProvider(useHasCreditCard)

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toBe(false)
    })
})
