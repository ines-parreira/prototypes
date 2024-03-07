import {renderHook} from '@testing-library/react-hooks'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {
    advancedMonthlyHelpdeskPrice,
    basicMonthlyHelpdeskPrice,
    proMonthlyHelpdeskPrice,
    starterHelpdeskPrice,
} from 'fixtures/productPrices'
import {assumeMock} from '../../../../../utils/testing'
import {FeatureFlagKey} from '../../../../../config/featureFlags'
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

    it('returns false if automated helpdesk cancellation flag is not set', () => {
        useFlagsMock.mockReturnValueOnce({
            [FeatureFlagKey.HelpdeskProductAutomatedCancellation]: false,
        })

        const {result} = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(
                proMonthlyHelpdeskPrice
            )
        )

        expect(result.current).toBe(false)
    })

    it('returns true for pro tier plan with automated helpdesk cancellation flag set', () => {
        useFlagsMock.mockReturnValueOnce({
            [FeatureFlagKey.HelpdeskProductAutomatedCancellation]: true,
        })

        const {result} = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(
                proMonthlyHelpdeskPrice
            )
        )

        expect(result.current).toBe(true)
    })

    it('returns true for basic tier plan with automated helpdesk cancellation flag set', () => {
        useFlagsMock.mockReturnValueOnce({
            [FeatureFlagKey.HelpdeskProductAutomatedCancellation]: true,
        })

        const {result} = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(
                basicMonthlyHelpdeskPrice
            )
        )

        expect(result.current).toBe(true)
    })

    it('returns true for starter tier plan with automated helpdesk cancellation flag set', () => {
        useFlagsMock.mockReturnValueOnce({
            [FeatureFlagKey.HelpdeskProductAutomatedCancellation]: true,
        })

        const {result} = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(starterHelpdeskPrice)
        )

        expect(result.current).toBe(true)
    })

    it('returns false for unsupported tier plan with automated helpdesk cancellation flag set', () => {
        useFlagsMock.mockReturnValueOnce({
            [FeatureFlagKey.HelpdeskProductAutomatedCancellation]: true,
        })

        const {result} = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(
                advancedMonthlyHelpdeskPrice
            )
        )

        expect(result.current).toBe(false)
    })
})
