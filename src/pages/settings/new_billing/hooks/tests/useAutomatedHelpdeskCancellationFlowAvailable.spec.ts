import {renderHook} from '@testing-library/react-hooks'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {
    advancedMonthlyHelpdeskPrice,
    basicMonthlyHelpdeskPrice,
    proMonthlyHelpdeskPrice,
    starterHelpdeskPrice,
} from 'fixtures/productPrices'
import {assumeMock} from '../../../../../utils/testing'
import useAutomatedHelpdeskCancellationFlowAvailable from '../useAutomatedHelpdeskCancellationFlowAvailable'

jest.mock('launchdarkly-react-client-sdk')
const useFlagsMock = assumeMock(useFlags)

describe('useAutomatedHelpdeskCancellationFlowAvailable', () => {
    afterEach(() => {
        useFlagsMock.mockClear()
    })

    it('returns false if helpdeskProduct is null', () => {
        const {result} = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(null)
        )
        expect(result.current).toBe(false)
    })

    it('returns true for pro tier plan', () => {
        const {result} = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(
                proMonthlyHelpdeskPrice
            )
        )

        expect(result.current).toBe(true)
    })

    it('returns true for basic tier plan', () => {
        const {result} = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(
                basicMonthlyHelpdeskPrice
            )
        )

        expect(result.current).toBe(true)
    })

    it('returns true for starter tier plan', () => {
        const {result} = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(starterHelpdeskPrice)
        )

        expect(result.current).toBe(true)
    })

    it('returns false for unsupported tier plan', () => {
        const {result} = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(
                advancedMonthlyHelpdeskPrice
            )
        )

        expect(result.current).toBe(false)
    })
})
