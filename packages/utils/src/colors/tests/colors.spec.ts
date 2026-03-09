import { isValidColor } from '../colors'

describe('isValidColor', () => {
    it('should return true when color has hexadecimal format', () => {
        expect(isValidColor('#27061d')).toBeTruthy()
    })

    it('should return true when color has hsla format', () => {
        expect(isValidColor('hsla(318, 76%, 51%, 1)')).toBeTruthy()
    })

    it('should return true when color has hsl format', () => {
        expect(isValidColor('rgb(39, 6, 29)')).toBeTruthy()
    })

    it('should return false when color has invalid format', () => {
        expect(isValidColor('#')).toBeFalsy()
    })

    it('should return false when color has invalid rgb format', () => {
        expect(isValidColor('rgb(jd, 20, 76)')).toBeFalsy()
    })

    it('should return false when input color is empty', () => {
        expect(isValidColor('')).toBeFalsy()
    })
})
