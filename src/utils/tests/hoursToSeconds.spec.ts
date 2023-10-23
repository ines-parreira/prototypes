import hoursToSeconds from '../hoursToSeconds'

describe('hoursToSeconds', () => {
    it('should return zero for undefined', () => {
        expect(hoursToSeconds()).toBe(0)
    })

    it('should return zero for non-numbers', () => {
        expect(hoursToSeconds('1')).toBe(0)
    })

    it('should convert hours to seconds', () => {
        expect(hoursToSeconds(2)).toBe(2 * 60 * 60)
    })
})
