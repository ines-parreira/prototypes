import {useElements} from '@stripe/react-stripe-js'
import {StripePaymentElementChangeEvent} from '@stripe/stripe-js'
import {renderHook, act} from '@testing-library/react-hooks'

import {assumeMock} from 'utils/testing'

import {useStripePaymentElement} from '../useStripePaymentElement'

jest.mock('@stripe/react-stripe-js', () => ({
    useElements: jest.fn(),
}))

let mockGetElement: jest.Mock
let mockOn: jest.Mock

const renderUseStripePaymentElementHook = () => {
    const result = renderHook(useStripePaymentElement)

    const onChange: (event: StripePaymentElementChangeEvent) => any =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        mockOn.mock.calls[0][1]

    return {
        ...result,
        changeHandler: (complete: boolean) =>
            act(() => {
                onChange({complete} as StripePaymentElementChangeEvent)
            }),
    }
}

describe('useStripePaymentElement hook', () => {
    beforeEach(() => {
        mockOn = jest.fn()
        mockGetElement = jest.fn(() => ({
            on: mockOn,
        }))
        assumeMock(useElements).mockReturnValue({
            getElement: mockGetElement,
        } as any)
    })

    it('should set isComplete to true when payment element event indicates completion', () => {
        const {result, changeHandler} = renderUseStripePaymentElementHook()

        expect(mockGetElement).toHaveBeenCalledWith('payment')
        expect(mockOn).toHaveBeenCalledWith('change', expect.any(Function))

        changeHandler(true)

        expect(result.current.isComplete).toBe(true)
    })

    it('should set isComplete to false when payment element event indicates incomplete', () => {
        const {result, changeHandler} = renderUseStripePaymentElementHook()

        changeHandler(false)

        expect(result.current.isComplete).toBe(false)
    })
})
