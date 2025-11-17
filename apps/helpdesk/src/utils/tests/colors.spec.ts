import type { getContrast } from 'color2k'

import { getEnoughContrastedColor, isValidColor } from '../colors'

const mockRaiseError = 'raise error'

jest.mock(
    'color2k',
    () =>
        ({
            __esModule: true,
            ...jest.requireActual('color2k'),
            getContrast: (...props: Parameters<typeof getContrast>) => {
                if (props[0] === mockRaiseError) {
                    throw new Error('Mocked error')
                }
                const {
                    getContrast: actualGetContrast,
                }: { getContrast: typeof getContrast } =
                    jest.requireActual('color2k')
                return actualGetContrast(...props)
            },
        }) as Record<string, unknown>,
)

describe('getEnoughContrastedColor', () => {
    it('should return same input color when the contrast is good enough', () => {
        expect(
            getEnoughContrastedColor('hsla(318, 76%, 51%, 1)', '#27061d'),
        ).toBe('hsla(318, 76%, 51%, 1)')
    })

    it('should return adjusted input color', () => {
        expect(
            getEnoughContrastedColor('hsla(318, 76%, 51%, 1)', '#620e49'),
        ).toBe('hsla(318, 76%, 61%, 1)')
    })
})

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
