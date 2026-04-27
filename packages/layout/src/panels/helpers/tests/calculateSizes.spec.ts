import { calculateSizes } from '../calculateSizes'

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
        'main-panel': {
            defaultSize: Infinity,
            minSize: 300,
            maxSize: Infinity,
        },
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

    it('should restore an existing prioritised panel from saved size when sibling panel changes', () => {
        const result = calculateSizes({
            availableSize,
            configs: configs,
            order: ['navigation', 'view'],
            previousOrder: ['navigation', 'main-panel'],
            previousSizes: {
                navigation: 350,
                'main-panel': 650,
            },
            savedSizes: { navigation: 260 },
        })

        expect(result).toEqual({
            navigation: 260,
            view: 740,
        })
    })

    it('should not grow a prioritised panel with saved size when a sibling panel is temporarily removed', () => {
        const result = calculateSizes({
            availableSize,
            configs: configs,
            order: ['navigation'],
            previousOrder: ['navigation', 'view'],
            previousSizes: {
                navigation: 350,
                view: 650,
            },
            savedSizes: { navigation: 260 },
        })

        expect(result).toEqual({
            navigation: 260,
        })
    })

    it('should restore an existing prioritised panel before a re-added sibling with saved size', () => {
        const result = calculateSizes({
            availableSize,
            configs: configs,
            order: ['navigation', 'main-panel'],
            previousOrder: ['navigation', 'view'],
            previousSizes: {
                navigation: 260,
                view: 740,
            },
            savedSizes: {
                navigation: 350,
                'main-panel': 740,
            },
        })

        expect(result).toEqual({
            navigation: 350,
            'main-panel': 650,
        })
    })

    it('should restore a re-added ticket list panel from saved size before expanding existing panels', () => {
        const result = calculateSizes({
            availableSize: 1400,
            configs: configs,
            order: ['navigation', 'ticket-list', 'ticket-detail'],
            previousOrder: ['navigation', 'ticket-detail'],
            previousSizes: {
                navigation: 238,
                'ticket-detail': 1162,
            },
            savedSizes: { 'ticket-list': 420 },
        })

        expect(result).toEqual({
            navigation: 238,
            'ticket-list': 420,
            'ticket-detail': 742,
        })
    })

    it('should restore a re-added infobar panel from saved size before expanding existing panels', () => {
        const result = calculateSizes({
            availableSize: 1400,
            configs: configs,
            order: ['navigation', 'ticket-detail', 'infobar'],
            previousOrder: ['navigation', 'ticket-detail'],
            previousSizes: {
                navigation: 238,
                'ticket-detail': 1162,
            },
            savedSizes: { infobar: 480 },
        })

        expect(result).toEqual({
            navigation: 238,
            infobar: 480,
            'ticket-detail': 682,
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
