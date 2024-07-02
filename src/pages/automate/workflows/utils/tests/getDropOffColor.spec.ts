import {
    HIGH_TIERS_DROPOFF_BACKGROUND,
    HIGH_TIERS_DROPOFF_COLOR,
    LOW_TIERS_DROPOFF_BACKGROUND,
    LOW_TIERS_DROPOFF_COLOR,
    MID_TIERS_DROPOFF_BACKGROUND,
    MID_TIERS_DROPOFF_COLOR,
} from '../../common/constants'
import {WorkflowDropoffMetricTiers} from '../../hooks/useWorkflowDropoffMetricTiers'
import {getDropoffColor} from '../getDropOffColor'

describe('getDropoffColor', () => {
    const tiers: WorkflowDropoffMetricTiers[] = [
        {
            range: [0, 17],
            color: LOW_TIERS_DROPOFF_COLOR,
            background: LOW_TIERS_DROPOFF_BACKGROUND,
        },
        {
            range: [18, 35],
            color: MID_TIERS_DROPOFF_COLOR,
            background: MID_TIERS_DROPOFF_BACKGROUND,
        },
        {
            range: [36, 53],
            color: HIGH_TIERS_DROPOFF_COLOR,
            background: HIGH_TIERS_DROPOFF_BACKGROUND,
        },
    ]

    it('should return the correct color for a dropoff rate within the low tier', () => {
        const dropOffRate = 10
        const dropOffTier = getDropoffColor(dropOffRate, tiers)
        expect(dropOffTier?.color).toBe(LOW_TIERS_DROPOFF_COLOR)
    })

    it('should return the correct color for a dropoff rate within the mid tier', () => {
        const dropOffRate = 25
        const dropOffTier = getDropoffColor(dropOffRate, tiers)
        expect(dropOffTier?.color).toBe(MID_TIERS_DROPOFF_COLOR)
    })

    it('should return the correct color for a dropoff rate within the high tier', () => {
        const dropOffRate = 40
        const dropOffTier = getDropoffColor(dropOffRate, tiers)
        expect(dropOffTier?.color).toBe(HIGH_TIERS_DROPOFF_COLOR)
    })

    it('should return null for a dropoff rate outside the defined tiers', () => {
        const dropOffRate = 75
        const dropOffTier = getDropoffColor(dropOffRate, tiers)
        expect(dropOffTier).toBeUndefined()
    })

    it('should return null for a dropoff rate below the defined tiers', () => {
        const dropOffRate = -1
        const dropOffTier = getDropoffColor(dropOffRate, tiers)
        expect(dropOffTier).toBeUndefined()
    })

    it('should return the correct color for the edge values within the tiers', () => {
        expect(getDropoffColor(0, tiers)?.color).toBe(LOW_TIERS_DROPOFF_COLOR)
        expect(getDropoffColor(17, tiers)?.color).toBe(LOW_TIERS_DROPOFF_COLOR)
        expect(getDropoffColor(18, tiers)?.color).toBe(MID_TIERS_DROPOFF_COLOR)
        expect(getDropoffColor(35, tiers)?.color).toBe(MID_TIERS_DROPOFF_COLOR)
        expect(getDropoffColor(36, tiers)?.color).toBe(HIGH_TIERS_DROPOFF_COLOR)
        expect(getDropoffColor(53, tiers)?.color).toBe(HIGH_TIERS_DROPOFF_COLOR)
    })
})
