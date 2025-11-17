import type { Config } from 'panels'

import { LayoutKeys } from '../../constants'
import createInitialConfig from '../createInitialConfig'

const defaultConfig: Config = [
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
]

describe('createInitialConfig', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    it('should return a config with default values if no widths are stored', () => {
        const defaultConfig: Config = [
            [100, 100, 100],
            [100, 100, 100],
            [100, 100, 100],
        ]
        const layoutKey = LayoutKeys.VIEW

        const config = createInitialConfig(layoutKey, defaultConfig)

        expect(config).toEqual(defaultConfig)
    })

    it('should return a config with individual stored values if widths are stored', () => {
        const expectedConfig = [
            [1, 100, 100],
            [2, 100, 100],
            [6, 100, 100],
            [3, 100, 100],
        ]

        jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            switch (key) {
                case 'navbar-width':
                    return '1'
                case 'ticket-list-width':
                    return 'v2;2'
                case 'infobar-width':
                    return '3'
                case LayoutKeys.TICKET:
                    return 'v2;4,5,6,7'
                default:
                    return null
            }
        })

        const config = createInitialConfig(LayoutKeys.TICKET, defaultConfig)

        expect(config).toEqual(expectedConfig)
    })

    it('should return the stored panels widths if individual widths are not stored', () => {
        const expectedConfig = [
            [4, 100, 100],
            [5, 100, 100],
            [6, 100, 100],
            [7, 100, 100],
        ]

        jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            switch (key) {
                case LayoutKeys.TICKET:
                    return 'v2;4,5,6,7'
                default:
                    return null
            }
        })

        const config = createInitialConfig(LayoutKeys.TICKET, defaultConfig)

        expect(config).toEqual(expectedConfig)
    })

    it('should return individual panels widths if the joint widths are not stored', () => {
        const expectedConfig = [
            [1, 100, 100],
            [2, 100, 100],
            [100, 100, 100],
            [4, 100, 100],
        ]

        jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            switch (key) {
                case 'navbar-width':
                    return '1'
                case 'ticket-list-width':
                    return 'v2;2'
                case 'infobar-width':
                    return '4'
                default:
                    return null
            }
        })

        const config = createInitialConfig(LayoutKeys.TICKET, defaultConfig)

        expect(config).toEqual(expectedConfig)
    })

    it('should not return ticket list width if layout key is not VIEW or TICKET', () => {
        const expectedConfig = [
            [1, 100, 100],
            [5, 100, 100],
            [3, 100, 100],
        ]

        jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            switch (key) {
                case 'navbar-width':
                    return '1'
                case 'ticket-list-width':
                    return 'v2;2'
                case 'infobar-width':
                    return '3'
                case LayoutKeys.FULL_TICKET:
                    return 'v2;4,5,6'
                default:
                    return null
            }
        })

        const config = createInitialConfig(LayoutKeys.FULL_TICKET, [
            [100, 100, 100],
            [100, 100, 100],
            [100, 100, 100],
        ])

        expect(config).toEqual(expectedConfig)
    })
})
