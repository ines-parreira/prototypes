import {
    createTicketViewNavigationData,
    TicketViewNavigationElementType,
} from '../createTicketViewNavigationData'
import type {
    TicketViewNavigationOrdering,
    TicketViewNavigationSection,
    TicketViewNavigationView,
} from '../createTicketViewNavigationData'

type TestView = TicketViewNavigationView & {
    id: number
    name: string
    section_id: number | null
    visibility: 'public' | 'private'
}

type TestSection = TicketViewNavigationSection & {
    id: number
    name: string
    private: boolean
}

const emptyOrdering: TicketViewNavigationOrdering = {
    view_sections: {},
    views: {},
}

const createView = (view: Partial<TestView> & Pick<TestView, 'id'>) => ({
    category: 'user',
    name: `View ${view.id}`,
    section_id: null,
    type: 'ticket-list',
    visibility: 'public',
    ...view,
})

const createSection = (
    section: Partial<TestSection> & Pick<TestSection, 'id'>,
) => ({
    name: `Section ${section.id}`,
    private: false,
    ...section,
})

describe('createTicketViewNavigationData', () => {
    it('builds shared and private navigation elements and lookup maps', () => {
        const sharedRootView = createView({ id: 1, name: 'Shared root' })
        const sharedSectionView = createView({
            id: 2,
            name: 'Shared child',
            section_id: 10,
        })
        const missingSectionView = createView({
            id: 3,
            name: 'Missing section',
            section_id: 999,
        })
        const systemView = createView({
            category: 'system',
            id: 4,
            name: 'System',
        })
        const customerView = createView({
            id: 5,
            name: 'Customer',
            type: 'customer-list',
        })
        const privateView = createView({
            id: 6,
            name: 'Private',
            visibility: 'private',
        })
        const sharedSection = createSection({ id: 10, name: 'Shared section' })
        const privateSection = createSection({
            id: 20,
            name: 'Private section',
            private: true,
        })

        const result = createTicketViewNavigationData({
            optimisticPrivateOrdering: emptyOrdering,
            optimisticSharedOrdering: emptyOrdering,
            persistedPrivateOrdering: emptyOrdering,
            persistedSharedOrdering: emptyOrdering,
            privateSections: [privateSection],
            privateViews: [privateView],
            sharedSections: [sharedSection],
            sharedViews: [
                sharedRootView,
                sharedSectionView,
                missingSectionView,
                systemView,
                customerView,
            ],
        })

        expect(result.sharedElements).toEqual([
            {
                data: sharedRootView,
                type: TicketViewNavigationElementType.View,
            },
            {
                data: missingSectionView,
                type: TicketViewNavigationElementType.View,
            },
            {
                children: [sharedSectionView],
                data: sharedSection,
                type: TicketViewNavigationElementType.Section,
            },
        ])
        expect(result.privateElements).toEqual([
            {
                data: privateView,
                type: TicketViewNavigationElementType.View,
            },
            {
                children: [],
                data: privateSection,
                type: TicketViewNavigationElementType.Section,
            },
        ])
        expect(result.viewsById).toEqual({
            1: sharedRootView,
            2: sharedSectionView,
            3: missingSectionView,
            4: systemView,
            5: customerView,
            6: privateView,
        })
        expect(result.sectionsById).toEqual({
            10: sharedSection,
            20: privateSection,
        })
    })

    it('sorts root elements and section children with optimistic ordering first', () => {
        const firstRoot = createView({ id: 1, name: 'First persisted root' })
        const optimisticRoot = createView({ id: 2, name: 'Optimistic root' })
        const firstChild = createView({
            id: 3,
            name: 'First persisted child',
            section_id: 10,
        })
        const optimisticChild = createView({
            id: 4,
            name: 'Optimistic child',
            section_id: 10,
        })
        const section = createSection({ id: 10 })
        const laterSection = createSection({ id: 20 })

        const result = createTicketViewNavigationData({
            optimisticPrivateOrdering: emptyOrdering,
            optimisticSharedOrdering: {
                view_sections: {
                    10: { display_order: 0 },
                },
                views: {
                    2: { display_order: 1 },
                    4: { display_order: 1 },
                },
            },
            persistedPrivateOrdering: emptyOrdering,
            persistedSharedOrdering: {
                view_sections: {
                    10: { display_order: 30 },
                    20: { display_order: 40 },
                },
                views: {
                    1: { display_order: 10 },
                    2: { display_order: 20 },
                    3: { display_order: 10 },
                    4: { display_order: 20 },
                },
            },
            privateSections: [],
            privateViews: [],
            sharedSections: [laterSection, section],
            sharedViews: [
                firstRoot,
                optimisticRoot,
                firstChild,
                optimisticChild,
            ],
        })

        expect(
            result.sharedElements.map((element) => ({
                id: element.data.id,
                type: element.type,
            })),
        ).toEqual([
            { id: 10, type: TicketViewNavigationElementType.Section },
            { id: 2, type: TicketViewNavigationElementType.View },
            { id: 1, type: TicketViewNavigationElementType.View },
            { id: 20, type: TicketViewNavigationElementType.Section },
        ])
        expect(result.sharedElements[0]).toEqual({
            children: [optimisticChild, firstChild],
            data: section,
            type: TicketViewNavigationElementType.Section,
        })
    })

    it('uses the legacy id-based tie-break for unordered views and sections', () => {
        const newestRootView = createView({ id: 99, name: 'Newest root' })
        const oldestRootView = createView({ id: 1, name: 'Oldest root' })
        const newestChildView = createView({
            id: 98,
            name: 'Newest child',
            section_id: 10,
        })
        const oldestChildView = createView({
            id: 2,
            name: 'Oldest child',
            section_id: 10,
        })
        const newestSection = createSection({ id: 20, name: 'Newest section' })
        const oldestSection = createSection({ id: 10, name: 'Oldest section' })

        const result = createTicketViewNavigationData({
            optimisticPrivateOrdering: emptyOrdering,
            optimisticSharedOrdering: emptyOrdering,
            persistedPrivateOrdering: emptyOrdering,
            persistedSharedOrdering: emptyOrdering,
            privateSections: [],
            privateViews: [],
            sharedSections: [newestSection, oldestSection],
            sharedViews: [
                newestRootView,
                oldestRootView,
                newestChildView,
                oldestChildView,
            ],
        })

        expect(
            result.sharedElements.map((element) => ({
                id: element.data.id,
                type: element.type,
            })),
        ).toEqual([
            { id: 1, type: TicketViewNavigationElementType.View },
            { id: 99, type: TicketViewNavigationElementType.View },
            { id: 10, type: TicketViewNavigationElementType.Section },
            { id: 20, type: TicketViewNavigationElementType.Section },
        ])
        expect(result.sharedElements[2]).toEqual({
            children: [oldestChildView, newestChildView],
            data: oldestSection,
            type: TicketViewNavigationElementType.Section,
        })
    })

    it('places newly-created unordered root views after existing ordered elements', () => {
        const newestRootView = createView({ id: 99, name: 'Newest root' })
        const existingRootView = createView({ id: 1, name: 'Existing root' })
        const section = createSection({ id: 10, name: 'Existing section' })

        const result = createTicketViewNavigationData({
            optimisticPrivateOrdering: emptyOrdering,
            optimisticSharedOrdering: emptyOrdering,
            persistedPrivateOrdering: emptyOrdering,
            persistedSharedOrdering: {
                view_sections: {
                    10: { display_order: 1 },
                },
                views: {
                    1: { display_order: 2 },
                },
            },
            privateSections: [],
            privateViews: [],
            sharedSections: [section],
            sharedViews: [newestRootView, existingRootView],
        })

        expect(
            result.sharedElements.map((element) => ({
                id: element.data.id,
                type: element.type,
            })),
        ).toEqual([
            { id: 10, type: TicketViewNavigationElementType.Section },
            { id: 1, type: TicketViewNavigationElementType.View },
            { id: 99, type: TicketViewNavigationElementType.View },
        ])
    })

    it('can return caller-provided element type values', () => {
        const result = createTicketViewNavigationData({
            elementTypes: {
                section: 'custom-section',
                view: 'custom-view',
            },
            optimisticPrivateOrdering: emptyOrdering,
            optimisticSharedOrdering: emptyOrdering,
            persistedPrivateOrdering: emptyOrdering,
            persistedSharedOrdering: emptyOrdering,
            privateSections: [],
            privateViews: [],
            sharedSections: [createSection({ id: 10 })],
            sharedViews: [createView({ id: 1 })],
        })

        expect(result.sharedElements.map((element) => element.type)).toEqual([
            'custom-view',
            'custom-section',
        ])
    })
})
