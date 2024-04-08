import {getContrast} from 'color2k'

import {getEnoughContrastedColor} from '../colors'

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

describe('getEnoughContrastedColor', () => {
    it('should return same input color when the contrast is good enough', () => {
        expect(
            getEnoughContrastedColor('hsla(318, 76%, 51%, 1)', '#27061d')
        ).toBe('hsla(318, 76%, 51%, 1)')
    })

    it('should return adjusted input color', () => {
        expect(
            getEnoughContrastedColor('hsla(318, 76%, 51%, 1)', '#620e49')
        ).toBe('hsla(318, 76%, 71%, 1)')
    })
})
