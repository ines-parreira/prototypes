import {useElements} from '@stripe/react-stripe-js'
import {StripeAddressElementChangeEvent} from '@stripe/stripe-js'
import {act, renderHook} from '@testing-library/react-hooks'

import {useStripeAddressElement} from 'pages/settings/new_billing/components/StripeAddressElement/useStripeAddressElement'
import {assumeMock} from 'utils/testing'

jest.mock('@stripe/react-stripe-js')

let changeHandler: (event: StripeAddressElementChangeEvent) => void

let blurHandler: () => void

const mockGetValue = jest.fn()

assumeMock(useElements).mockReturnValue({
    getElement: jest.fn().mockReturnValue({
        on: jest.fn().mockImplementation((eventType, handler) => {
            if (eventType === 'change') {
                changeHandler = handler
            }

            // eventType === 'blur'
            blurHandler = handler
        }),
        getValue: mockGetValue,
    }),
} as any)

describe('useStripeAddressElement', () => {
    it('should not update the error state until the address element is complete', async () => {
        const {result, waitFor} = renderHook(useStripeAddressElement)

        expect(result.current.isComplete).toBe(false)
        expect(result.current.error).toBeUndefined()

        act(() => {
            changeHandler({
                complete: false,
                value: {address: {postal_code: '00000', country: 'US'}},
            } as any)
        })

        expect(result.current.getValue()).toEqual({
            address: {postal_code: '00000', country: 'US'},
        })
        expect(result.current.isComplete).toBe(false)
        expect(result.current.error).toBeUndefined()

        act(() => {
            changeHandler({
                complete: true,
                value: {address: {postal_code: '00000', country: 'US'}},
            } as any)
        })

        expect(result.current.getValue()).toEqual({
            address: {postal_code: '00000', country: 'US'},
        })
        expect(result.current.isComplete).toBe(false)
        expect(result.current.error).toEqual('Postal code is invalid')

        act(() => {
            changeHandler({
                complete: true,
                value: {address: {postal_code: '00000', country: undefined}},
            } as any)
        })

        expect(result.current.error).toBeUndefined()

        act(() => {
            changeHandler({
                complete: true,
                value: {address: {postal_code: '10000', country: 'US'}},
            } as any)
        })

        expect(result.current.isComplete).toBe(true)
        expect(result.current.error).toBeUndefined()

        blurHandler()

        await waitFor(() => {
            expect(mockGetValue).toHaveBeenCalled()
        })
    })
})
