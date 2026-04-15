import { useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'

import checkIsEnterpriseGMV from '../../utils/checkIsEnterpriseGMV'
import useAutomatedHelpdeskCancellationFlowAvailable from '../useAutomatedHelpdeskCancellationFlowAvailable'
import type { useIsCancellationAvailableProps } from '../useIsCancellationAvailable'
import useIsCancellationAvailable from '../useIsCancellationAvailable'

vi.mock('@repo/feature-flags')
const mockUseFlag = assumeMock(useFlag)
vi.mock('../useAutomatedHelpdeskCancellationFlowAvailable')
const mockUseAutomatedHelpdeskCancellationFlowAvailable = assumeMock(
    useAutomatedHelpdeskCancellationFlowAvailable,
)
vi.mock('../../utils/checkIsEnterpriseGMV')
const mockCheckIsEnterpriseGMV = assumeMock(checkIsEnterpriseGMV)

const renderIsCancellationAvailable = (
    params: useIsCancellationAvailableProps,
) => {
    return renderHook(() => useIsCancellationAvailable(params))
}

describe('useIsCancellationAvailable', () => {
    const defaultParams: useIsCancellationAvailableProps = {
        helpdeskPlan: {
            plan_id: 'test-plan',
        } as useIsCancellationAvailableProps['helpdeskPlan'],
        editingAvailable: true,
        isTrialing: false,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockUseFlag.mockReturnValue(false)
        mockUseAutomatedHelpdeskCancellationFlowAvailable.mockReturnValue(true)
        mockCheckIsEnterpriseGMV.mockReturnValue(false)
    })

    it('should return true when all conditions are met', () => {
        const { result } = renderIsCancellationAvailable(defaultParams)
        expect(result.current).toBe(true)
    })

    it('should return false when useAutomatedHelpdeskCancellationFlowAvailable returns false', () => {
        mockUseAutomatedHelpdeskCancellationFlowAvailable.mockReturnValue(false)

        const { result } = renderIsCancellationAvailable(defaultParams)
        expect(result.current).toBe(false)
    })

    it('should return false when editingAvailable is false', () => {
        const params = { ...defaultParams, editingAvailable: false }
        const { result } = renderIsCancellationAvailable(params)
        expect(result.current).toBe(false)
    })

    it('should return false when isTrialing is true', () => {
        const params = { ...defaultParams, isTrialing: true }
        const { result } = renderIsCancellationAvailable(params)
        expect(result.current).toBe(false)
    })

    it('should return false when disableAutoRenewalCancellationForEnterpriseGMV feature flag is true and customer is EntepriseGMV', () => {
        mockUseFlag.mockReturnValue(true)
        mockCheckIsEnterpriseGMV.mockReturnValue(true)

        const { result } = renderIsCancellationAvailable(defaultParams)
        expect(result.current).toBe(false)
    })
})
