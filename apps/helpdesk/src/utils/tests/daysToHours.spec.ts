import daysToHours from '../daysToHours'

describe('daysToHours', () => {
    it('should convert days to hours', () => {
        expect(daysToHours(2)).toBe(48)
    })
})
