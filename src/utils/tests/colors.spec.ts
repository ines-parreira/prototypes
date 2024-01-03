import {getContrast} from 'color2k'
import lightColorTokens from '@gorgias/design-tokens/dist/tokens/color/merchantLight.json'

import {getTextColorBasedOnBackground} from '../colors'

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
                }: {getContrast: typeof getContrast} =
                    jest.requireActual('color2k')
                return actualGetContrast(...props)
            },
        } as Record<string, unknown>)
)

describe('getTextColorBasedOnBackground', () => {
    const darkTextColor = '#000'
    const lightTextColor = '#fff'

    it('should return default light text color', () => {
        expect(getTextColorBasedOnBackground('#8c1367')).toBe(
            lightColorTokens.Light.Neutral.Grey_0.value
        )
    })

    it('should return default dark text color', () => {
        expect(getTextColorBasedOnBackground('#0693e3')).toBe(
            lightColorTokens.Light.Neutral.Grey_6.value
        )
    })

    it('should return light text color', () => {
        expect(
            getTextColorBasedOnBackground('#8c1367', {
                lightTextColor,
                darkTextColor,
            })
        ).toBe(lightTextColor)
    })

    it('should return dark text color', () => {
        expect(
            getTextColorBasedOnBackground('#0693e3', {
                lightTextColor,
                darkTextColor,
            })
        ).toBe(darkTextColor)
    })

    it('should return light text color with custom contrast level', () => {
        expect(
            getTextColorBasedOnBackground('#0693e3', {
                lightTextColor,
                darkTextColor,
                contrastLevel: 2.5,
            })
        ).toBe(lightTextColor)
    })

    it('should return light text color on error', () => {
        const result = getTextColorBasedOnBackground(mockRaiseError)

        expect(result).toBe(lightColorTokens.Light.Neutral.Grey_0.value)
    })
})
