import {renderHook} from '@testing-library/react-hooks'
import useWorkflowDropoffMetricTiers from '../useWorkflowDropoffMetricTiers'
import {
    HIGH_TIERS_DROPOFF_COLOR,
    LOW_TIERS_DROPOFF_COLOR,
    MID_TIERS_DROPOFF_COLOR,
} from '../../common/constants'

describe('useWorkflowDropoffMetricTiers', () => {
    it('should return an empty array when dropOffRates is empty', () => {
        const {result} = renderHook(() =>
            useWorkflowDropoffMetricTiers({dropOffRates: []})
        )

        expect(result.current).toEqual([])
    })

    it('should return correct tiers when dropOffRates has one element', () => {
        const dropOffRates = [53]
        const {result} = renderHook(() =>
            useWorkflowDropoffMetricTiers({dropOffRates})
        )

        const expectedTiers = [
            {range: [0, 18], color: LOW_TIERS_DROPOFF_COLOR},
            {range: [19, 35], color: MID_TIERS_DROPOFF_COLOR},
            {range: [36, 53], color: HIGH_TIERS_DROPOFF_COLOR},
        ]
        expect(result.current).toEqual(expectedTiers)
    })

    it('should return correct tiers when dropOffRates has multiple elements', () => {
        const dropOffRates = [17, 12, 53, 17, 0, 0, 33, 20, 0, 0, 0]
        const {result} = renderHook(() =>
            useWorkflowDropoffMetricTiers({dropOffRates})
        )

        const expectedTiers = [
            {range: [0, 18], color: LOW_TIERS_DROPOFF_COLOR},
            {range: [19, 35], color: MID_TIERS_DROPOFF_COLOR},
            {range: [36, 53], color: HIGH_TIERS_DROPOFF_COLOR},
        ]
        expect(result.current).toEqual(expectedTiers)
    })
})
