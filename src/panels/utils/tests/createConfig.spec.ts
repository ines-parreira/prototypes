import { Config } from 'panels'

import createConfig from '../createConfig'

describe('createConfig', () => {
    const defaultConfig: Config = [
        [100, 100, 100],
        [100, 100, 100],
        [100, 100, 100],
        [100, 100, 100],
    ]

    it('should transform the default config with the provided widths', () => {
        const widths = [1, 2, 3, 4]

        const expectedConfig = [
            [1, 100, 100],
            [2, 100, 100],
            [3, 100, 100],
            [4, 100, 100],
        ]

        const config = createConfig(widths, defaultConfig)
        expect(config).toEqual(expectedConfig)
    })

    it('should respect the default config if some widths are not provided', () => {
        const widths = [1, 2]
        const expectedConfig = [
            [1, 100, 100],
            [2, 100, 100],
            [100, 100, 100],
            [100, 100, 100],
        ]

        const config = createConfig(widths, defaultConfig)
        expect(config).toEqual(expectedConfig)
    })

    it('should respect the original infinity constraint on the last width', () => {
        const widths = [1, 2, 3, 4]
        const defaultConfig: Config = [
            [100, 100, 100],
            [100, 100, 100],
            [100, 100, 100],
            [Infinity, 100, 100],
        ]

        const expectedConfig = [
            [1, 100, 100],
            [2, 100, 100],
            [3, 100, 100],
            [Infinity, 100, 100],
        ]

        const config = createConfig(widths, defaultConfig)
        expect(config).toEqual(expectedConfig)
    })

    it('should not respect the original infinity constraint on a width if it is not the last width', () => {
        const widths = [1, 2, 3, 4]
        const defaultConfig: Config = [
            [100, 100, 100],
            [100, 100, 100],
            [Infinity, 100, 100],
            [100, 100, 100],
        ]

        const expectedConfig = [
            [1, 100, 100],
            [2, 100, 100],
            [3, 100, 100],
            [4, 100, 100],
        ]

        const config = createConfig(widths, defaultConfig)
        expect(config).toEqual(expectedConfig)
    })
})
