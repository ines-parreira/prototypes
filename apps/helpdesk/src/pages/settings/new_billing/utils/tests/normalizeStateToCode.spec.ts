import { normalizeStateToCode } from '../normalizeStateToCode'

describe('normalizeStateToCode', () => {
    describe('US states', () => {
        it('should convert full state names to codes', () => {
            expect(normalizeStateToCode('Colorado', 'US')).toBe('CO')
            expect(normalizeStateToCode('California', 'US')).toBe('CA')
            expect(normalizeStateToCode('New York', 'US')).toBe('NY')
            expect(normalizeStateToCode('Texas', 'US')).toBe('TX')
        })

        it('should handle already-coded states', () => {
            expect(normalizeStateToCode('CO', 'US')).toBe('CO')
            expect(normalizeStateToCode('ca', 'US')).toBe('CA')
            expect(normalizeStateToCode('NY', 'US')).toBe('NY')
        })

        it('should be case-insensitive for full names', () => {
            expect(normalizeStateToCode('colorado', 'US')).toBe('CO')
            expect(normalizeStateToCode('COLORADO', 'US')).toBe('CO')
            expect(normalizeStateToCode('CoLoRaDo', 'US')).toBe('CO')
        })

        it('should handle US territories', () => {
            expect(normalizeStateToCode('Puerto Rico', 'US')).toBe('PR')
            expect(normalizeStateToCode('Guam', 'US')).toBe('GU')
            expect(normalizeStateToCode('Virgin Islands', 'US')).toBe('VI')
            expect(normalizeStateToCode('American Samoa', 'US')).toBe('AS')
        })

        it('should handle District of Columbia', () => {
            expect(normalizeStateToCode('District Of Columbia', 'US')).toBe(
                'DC',
            )
        })
    })

    describe('Canadian provinces', () => {
        it('should convert full province names to codes', () => {
            expect(normalizeStateToCode('British Columbia', 'CA')).toBe('BC')
            expect(normalizeStateToCode('Ontario', 'CA')).toBe('ON')
            expect(normalizeStateToCode('Québec', 'CA')).toBe('QC')
            expect(normalizeStateToCode('Alberta', 'CA')).toBe('AB')
        })

        it('should handle already-coded provinces', () => {
            expect(normalizeStateToCode('BC', 'CA')).toBe('BC')
            expect(normalizeStateToCode('on', 'CA')).toBe('ON')
        })

        it('should handle Quebec with and without accent (accent-insensitive)', () => {
            expect(normalizeStateToCode('Québec', 'CA')).toBe('QC')
            expect(normalizeStateToCode('Quebec', 'CA')).toBe('QC')
            expect(normalizeStateToCode('QUEBEC', 'CA')).toBe('QC')
        })
    })

    describe('edge cases', () => {
        it('should return null for null state', () => {
            expect(normalizeStateToCode(null, 'US')).toBeNull()
            expect(normalizeStateToCode(null, 'CA')).toBeNull()
        })

        it('should return original state when country is empty string', () => {
            expect(normalizeStateToCode('Colorado', '')).toBe('Colorado')
            expect(normalizeStateToCode('CO', '')).toBe('CO')
        })

        it('should return null when state is null and country is empty', () => {
            expect(normalizeStateToCode(null, '')).toBeNull()
        })

        it('should return original value for unknown states', () => {
            expect(normalizeStateToCode('Unknown State', 'US')).toBe(
                'Unknown State',
            )
        })

        it('should return original value for unsupported countries', () => {
            expect(normalizeStateToCode('Some State', 'XX')).toBe('Some State')
        })

        it('should handle empty string state', () => {
            expect(normalizeStateToCode('', 'US')).toBe('')
        })
    })

    describe('multi-word states', () => {
        it('should handle states with multiple words', () => {
            expect(normalizeStateToCode('New Hampshire', 'US')).toBe('NH')
            expect(normalizeStateToCode('New Jersey', 'US')).toBe('NJ')
            expect(normalizeStateToCode('New Mexico', 'US')).toBe('NM')
            expect(normalizeStateToCode('North Carolina', 'US')).toBe('NC')
            expect(normalizeStateToCode('North Dakota', 'US')).toBe('ND')
            expect(normalizeStateToCode('South Carolina', 'US')).toBe('SC')
            expect(normalizeStateToCode('South Dakota', 'US')).toBe('SD')
            expect(normalizeStateToCode('West Virginia', 'US')).toBe('WV')
        })
    })
})
