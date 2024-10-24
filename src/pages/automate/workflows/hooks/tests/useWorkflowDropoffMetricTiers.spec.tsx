import {renderHook} from '@testing-library/react-hooks'

import {
    HIGH_TIERS_DROPOFF_BACKGROUND,
    HIGH_TIERS_DROPOFF_COLOR,
    LOW_TIERS_DROPOFF_BACKGROUND,
    LOW_TIERS_DROPOFF_COLOR,
    MID_TIERS_DROPOFF_BACKGROUND,
    MID_TIERS_DROPOFF_COLOR,
} from '../../common/constants'
import useWorkflowDropoffMetricTiers from '../useWorkflowDropoffMetricTiers'

describe('useWorkflowDropoffMetricTiers', () => {
    it('should return LOW TIER range when dropOffRates is empty', () => {
        const {result} = renderHook(() =>
            useWorkflowDropoffMetricTiers({dropOffRates: []})
        )

        expect(result.current).toEqual([
            {
                range: [0, 0],
                color: LOW_TIERS_DROPOFF_COLOR,
                background: LOW_TIERS_DROPOFF_BACKGROUND,
            },
        ])
    })

    it('should return correct tiers when dropOffRates has one element', () => {
        const dropOffRates = [53]
        const {result} = renderHook(() =>
            useWorkflowDropoffMetricTiers({dropOffRates})
        )

        const expectedTiers = [
            {
                range: [53, 53],
                color: LOW_TIERS_DROPOFF_COLOR,
                background: LOW_TIERS_DROPOFF_BACKGROUND,
            },
        ]
        expect(result.current).toEqual(expectedTiers)
    })

    it('should return correct tiers when dropOffRates has multiple elements', () => {
        const dropOffRates = [17, 12, 53, 17, 0, 0, 33, 20, 0, 0, 0]
        const {result} = renderHook(() =>
            useWorkflowDropoffMetricTiers({dropOffRates})
        )

        const expectedTiers = [
            {
                range: [0, 17.67],
                color: LOW_TIERS_DROPOFF_COLOR,
                background: LOW_TIERS_DROPOFF_BACKGROUND,
            },
            {
                range: [17.67, 35.33],
                color: MID_TIERS_DROPOFF_COLOR,
                background: MID_TIERS_DROPOFF_BACKGROUND,
            },
            {
                range: [35.33, 53],
                color: HIGH_TIERS_DROPOFF_COLOR,
                background: HIGH_TIERS_DROPOFF_BACKGROUND,
            },
        ]
        expect(result.current).toEqual(expectedTiers)
    })
})
