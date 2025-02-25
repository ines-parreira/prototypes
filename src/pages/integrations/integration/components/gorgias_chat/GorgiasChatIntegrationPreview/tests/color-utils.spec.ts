import { CONSTRAST_COLORS, getTextColorBasedOnBackground } from '../color-utils'

describe('color-utils', () => {
    it('should export constant values', () => {
        expect(CONSTRAST_COLORS.LIGHT).toBe('#FFFFFF')
        expect(CONSTRAST_COLORS.DARK).toBe('#161616')
    })

    describe('method "getTextColorBasedOnBackground", for a call', () => {
        it('with light color, should return dark contrast color', () => {
            expect(getTextColorBasedOnBackground('#ffff')).toBe(
                CONSTRAST_COLORS.DARK,
            )
        })

        it('with dark color, should return light contrast color', () => {
            expect(getTextColorBasedOnBackground('#151515')).toBe(
                CONSTRAST_COLORS.LIGHT,
            )
        })

        it('with no color value, should return light contrast color', () => {
            expect(getTextColorBasedOnBackground('')).toBe(
                CONSTRAST_COLORS.LIGHT,
            )
        })
    })
})
