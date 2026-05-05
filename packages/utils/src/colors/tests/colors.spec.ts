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

    it.each([
        ['rgb(39, 6, 29)'],
        ['rgb(100%, 0%, 50%)'],
        ['rgba(39, 6, 29, 0.5)'],
        ['rgba(39, 6, 29, 50%)'],
    ])('should return true when rgb color is valid: %s', (color) => {
        expect(isValidColor(color)).toBeTruthy()
    })

    it('should return false when color has invalid format', () => {
        expect(isValidColor('#')).toBeFalsy()
    })

    it.each([
        ['rgb(jd, 20, 76)'],
        ['rgb(256, 20, 76)'],
        ['rgb(39.5, 20, 76)'],
        ['rgb(101%, 20%, 76%)'],
        ['rgb(39, 20)'],
        ['rgba(39, 20, 76, 1.1)'],
        ['rgba(39, 20, 76, 101%)'],
        ['rgba(39, 20, 76, 1, 0)'],
    ])('should return false when rgb color is invalid: %s', (color) => {
        expect(isValidColor(color)).toBeFalsy()
    })

    it('should return false when input color is empty', () => {
        expect(isValidColor('')).toBeFalsy()
    })
})
