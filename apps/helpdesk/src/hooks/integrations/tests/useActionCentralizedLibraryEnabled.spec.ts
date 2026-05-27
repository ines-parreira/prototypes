import { isAtLeastMilestone } from '../useActionCentralizedLibraryEnabled'

describe('isAtLeastMilestone()', () => {
    it('returns false when the flag is OFF', () => {
        expect(isAtLeastMilestone('OFF', 'MILESTONE-1')).toBe(false)
        expect(isAtLeastMilestone('OFF', 'MILESTONE-2')).toBe(false)
        expect(isAtLeastMilestone('OFF', 'MILESTONE-3')).toBe(false)
    })

    it('returns false when current milestone is below the target', () => {
        expect(isAtLeastMilestone('MILESTONE-1', 'MILESTONE-2')).toBe(false)
        expect(isAtLeastMilestone('MILESTONE-2', 'MILESTONE-3')).toBe(false)
    })

    it('returns true when current milestone meets or exceeds the target', () => {
        expect(isAtLeastMilestone('MILESTONE-2', 'MILESTONE-2')).toBe(true)
        expect(isAtLeastMilestone('MILESTONE-3', 'MILESTONE-2')).toBe(true)
        expect(isAtLeastMilestone('MILESTONE-3', 'MILESTONE-1')).toBe(true)
    })

    it('treats underscore- and lowercase-variants as equivalent', () => {
        expect(isAtLeastMilestone('MILESTONE_2', 'MILESTONE-2')).toBe(true)
        expect(isAtLeastMilestone('milestone-2', 'MILESTONE-2')).toBe(true)
        expect(isAtLeastMilestone('milestone_2', 'MILESTONE-2')).toBe(true)
        expect(isAtLeastMilestone('off', 'MILESTONE-2')).toBe(false)
    })
})
