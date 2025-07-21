import { findSecondaryReasonsByPrimaryReason } from '../helpers'

describe('findSecondaryReasonsByPrimaryReason', () => {
    it('should return secondary reasons for the given primary reason', () => {
        const primaryReason = { label: 'primary' }
        const reasons = [
            {
                primaryReason: primaryReason,
                secondaryReasons: [
                    { label: 'secondary1' },
                    { label: 'secondary2' },
                ],
            },
            {
                primaryReason: { label: 'otherPrimary' },
                secondaryReasons: [{ label: 'secondary3' }],
            },
        ]
        const result = findSecondaryReasonsByPrimaryReason(
            primaryReason,
            reasons,
        )
        expect(result).toEqual([
            { label: 'secondary1' },
            { label: 'secondary2' },
        ])
    })

    it('should return an error if secondary reason is not found', () => {
        const reasons = [
            {
                primaryReason: { label: 'otherPrimary' },
                secondaryReasons: [{ label: 'secondary3' }],
            },
        ]
        expect(() => {
            findSecondaryReasonsByPrimaryReason(
                { label: 'reasonDoesNotExist' },
                reasons,
            )
        }).toThrow(
            new Error('Secondary reasons not found for reasonDoesNotExist.'),
        )
    })
})
