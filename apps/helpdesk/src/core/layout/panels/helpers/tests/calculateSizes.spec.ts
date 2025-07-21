import calculateSizes from '../calculateSizes'

describe('calculateSizes', () => {
    const availableSize = 1000
    const configs = {
        'global-navigation': { defaultSize: 48, minSize: 48, maxSize: 48 },
        infobar: { defaultSize: 340, minSize: 340, maxSize: 500 },
        navigation: {
            defaultSize: 238,
            minSize: 200,
            maxSize: 350,
            prioritise: true,
        },
        'ticket-detail': {
            defaultSize: Infinity,
            minSize: 300,
            maxSize: Infinity,
        },
        'ticket-empty': {
            defaultSize: Infinity,
            minSize: 100,
            maxSize: Infinity,
        },
        'ticket-list': { defaultSize: 300, minSize: 300, maxSize: 450 },
        view: { defaultSize: Infinity, minSize: 300, maxSize: Infinity },
    }
    const savedSizes = {}

    it('should handle an initial render of the view page', () => {
        const result = calculateSizes({
            availableSize,
            configs: configs,
            order: ['global-navigation', 'navigation', 'view'],
            previousOrder: [],
            previousSizes: {},
            savedSizes,
        })

        expect(result).toEqual({
            'global-navigation': 48,
            navigation: 238,
            view: 714,
        })
    })

    it('should handle an initial render of the view page with dtp enabled', () => {
        const result = calculateSizes({
            availableSize,
            configs: configs,
            order: [
                'global-navigation',
                'navigation',
                'ticket-list',
                'ticket-empty',
            ],
            previousOrder: [],
            previousSizes: {},
            savedSizes,
        })

        expect(result).toEqual({
            'global-navigation': 48,
            navigation: 238,
            'ticket-empty': 414,
            'ticket-list': 300,
        })
    })

    it('should handle an initial render of the ticket page', () => {
        const result = calculateSizes({
            availableSize,
            configs: configs,
            order: [
                'global-navigation',
                'navigation',
                'ticket-detail',
                'infobar',
            ],
            previousOrder: [],
            previousSizes: {},
            savedSizes,
        })

        expect(result).toEqual({
            'global-navigation': 48,
            infobar: 340,
            navigation: 238,
            'ticket-detail': 374,
        })
    })

    it('should handle an initial render of the ticket page with dtp enabled', () => {
        const result = calculateSizes({
            availableSize: 1400,
            configs: configs,
            order: [
                'global-navigation',
                'navigation',
                'ticket-list',
                'ticket-detail',
                'infobar',
            ],
            previousOrder: [],
            previousSizes: {},
            savedSizes,
        })

        expect(result).toEqual({
            'global-navigation': 48,
            infobar: 340,
            navigation: 238,
            'ticket-detail': 474,
            'ticket-list': 300,
        })
    })

    it('should restore the the navbar to its previous size', () => {
        const result = calculateSizes({
            availableSize,
            configs: configs,
            order: ['global-navigation', 'navigation', 'view'],
            previousOrder: ['global-navigation', 'view'],
            previousSizes: {
                'global-navigation': 48,
                navigation: 238,
                view: 714,
            },
            savedSizes: { navigation: 300 },
        })

        expect(result).toEqual({
            'global-navigation': 48,
            navigation: 300,
            view: 652,
        })
    })

    it('should handle going from the view page to a ticket page', () => {
        const result = calculateSizes({
            availableSize,
            configs: configs,
            order: [
                'global-navigation',
                'navigation',
                'ticket-detail',
                'infobar',
            ],
            previousOrder: ['global-navigation', 'navigation', 'view'],
            previousSizes: {
                'global-navigation': 48,
                navigation: 238,
                view: 714,
            },
            savedSizes,
        })

        expect(result).toEqual({
            'global-navigation': 48,
            infobar: 340,
            navigation: 238,
            'ticket-detail': 374,
        })
    })

    it('should handle going from the view page to a ticket page with dtp enabled', () => {
        const result = calculateSizes({
            availableSize: 1400,
            configs: configs,
            order: [
                'global-navigation',
                'navigation',
                'ticket-list',
                'ticket-detail',
                'infobar',
            ],
            previousOrder: [
                'global-navigation',
                'navigation',
                'ticket-list',
                'ticket-empty',
            ],
            previousSizes: {
                'global-navigation': 48,
                navigation: 238,
                'ticket-empty': 814,
                'ticket-list': 300,
            },
            savedSizes,
        })

        expect(result).toEqual({
            'global-navigation': 48,
            navigation: 238,
            'ticket-list': 300,
            'ticket-detail': 474,
            infobar: 340,
        })
    })

    it('should handle dismissing dtp on a ticket page', () => {
        const result = calculateSizes({
            availableSize: 1400,
            configs: configs,
            order: [
                'global-navigation',
                'navigation',
                'ticket-detail',
                'infobar',
            ],
            previousOrder: [
                'global-navigation',
                'navigation',
                'ticket-list',
                'ticket-detail',
                'infobar',
            ],
            previousSizes: {
                'global-navigation': 48,
                infobar: 340,
                navigation: 238,
                'ticket-detail': 474,
                'ticket-list': 300,
            },
            savedSizes,
        })

        expect(result).toEqual({
            'global-navigation': 48,
            infobar: 340,
            navigation: 238,
            'ticket-detail': 774,
        })
    })

    it('should handle collapsing the navbar on a ticket page', () => {
        const result = calculateSizes({
            availableSize: 1400,
            configs: configs,
            order: [
                'global-navigation',
                'ticket-list',
                'ticket-detail',
                'infobar',
            ],
            previousOrder: [
                'global-navigation',
                'navigation',
                'ticket-list',
                'ticket-detail',
                'infobar',
            ],
            previousSizes: {
                'global-navigation': 48,
                infobar: 340,
                navigation: 238,
                'ticket-detail': 474,
                'ticket-list': 300,
            },
            savedSizes,
        })

        expect(result).toEqual({
            'global-navigation': 48,
            infobar: 340,
            'ticket-detail': 712,
            'ticket-list': 300,
        })
    })

    it('should handle resizes', () => {
        const result = calculateSizes({
            availableSize: 1400,
            configs: configs,
            order: [
                'global-navigation',
                'navigation',
                'ticket-list',
                'ticket-empty',
            ],
            previousOrder: [
                'global-navigation',
                'navigation',
                'ticket-list',
                'ticket-empty',
            ],
            previousSizes: {
                'global-navigation': 48,
                navigation: 238,
                'ticket-empty': 414,
                'ticket-list': 300,
            },
            savedSizes,
        })

        expect(result).toEqual({
            'global-navigation': 48,
            navigation: 350,
            'ticket-empty': 558,
            'ticket-list': 444,
        })
    })
})
