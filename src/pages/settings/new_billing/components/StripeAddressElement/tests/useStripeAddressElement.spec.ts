import {useElements} from '@stripe/react-stripe-js'
import {StripeAddressElementChangeEvent} from '@stripe/stripe-js'
import {act, renderHook} from '@testing-library/react-hooks'

import {useStripeAddressElement} from 'pages/settings/new_billing/components/StripeAddressElement/useStripeAddressElement'
import {assumeMock} from 'utils/testing'

jest.mock('@stripe/react-stripe-js')

describe('useStripeAddressElement', () => {
    it('should not update the error state until the address element is complete', () => {
        let changeHandler: (event: StripeAddressElementChangeEvent) => void

        assumeMock(useElements).mockReturnValue({
            getElement: jest.fn().mockReturnValue({
                on: jest.fn().mockImplementation((_event, handler) => {
                    changeHandler = handler
                }),
            }),
        } as any)

        const {result} = renderHook(useStripeAddressElement)

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
    })
})
