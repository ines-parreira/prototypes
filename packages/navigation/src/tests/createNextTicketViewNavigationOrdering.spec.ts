import {
    createNextTicketViewNavigationOrdering,
    TicketViewNavigationDropDirection,
} from '../createNextTicketViewNavigationOrdering'
import type {
    TicketViewNavigationElement,
    TicketViewNavigationSection,
    TicketViewNavigationView,
} from '../createTicketViewNavigationData'

type TestView = TicketViewNavigationView & {
    id: number
    name: string
    section_id: number | null
}

type TestSection = TicketViewNavigationSection & {
    id: number
    name: string
}

const elementTypes = {
    section: 'section',
    view: 'view',
} as const

const createView = (id: number, section_id: number | null = null) => ({
    category: 'user',
    id,
    name: `View ${id}`,
    section_id,
    type: 'ticket-list',
})

const createSection = (id: number) => ({
    id,
    name: `Section ${id}`,
})

describe('createNextTicketViewNavigationOrdering', () => {
    const viewsById = {
        1: createView(1),
        2: createView(2),
        3: createView(3, 1),
        4: createView(4, 1),
        5: createView(5, 1),
        6: createView(6, 2),
    }
    const sectionsById = {
        1: createSection(1),
        2: createSection(2),
    }
    const orderedElements: TicketViewNavigationElement<
        TestView,
        TestSection,
        typeof elementTypes.view,
        typeof elementTypes.section
    >[] = [
        {
            data: viewsById[1],
            type: elementTypes.view,
        },
        {
            data: viewsById[2],
            type: elementTypes.view,
        },
        {
            children: [viewsById[3], viewsById[4], viewsById[5]],
            data: sectionsById[1],
            type: elementTypes.section,
        },
        {
            children: [viewsById[6]],
            data: sectionsById[2],
            type: elementTypes.section,
        },
    ]

    const createOrdering = (
        item: { id: number; type: 'section' | 'view' },
        dropResult: {
            direction: 'down' | 'up'
            sectionId: number | null
            viewId: number | null
        },
    ) =>
        createNextTicketViewNavigationOrdering({
            dropResult,
            elementTypes,
            item,
            orderedElements,
            sectionsById,
            viewsById,
        })

    it('moves a root view to a root view', () => {
        const nextOrdering = createOrdering(
            { id: 1, type: elementTypes.view },
            {
                direction: TicketViewNavigationDropDirection.Down,
                sectionId: null,
                viewId: 2,
            },
        )

        expect(nextOrdering.views[2].display_order).toBe(0)
        expect(nextOrdering.views[1].display_order).toBe(1)
        expect(nextOrdering.view_sections[1].display_order).toBe(2)
        expect(nextOrdering.views[3].display_order).toBe(3)
        expect(nextOrdering.views[4].display_order).toBe(4)
        expect(nextOrdering.views[5].display_order).toBe(5)
        expect(nextOrdering.view_sections[2].display_order).toBe(6)
        expect(nextOrdering.views[6].display_order).toBe(7)
    })

    it('moves a root view to a section view', () => {
        const nextOrdering = createOrdering(
            { id: 1, type: elementTypes.view },
            {
                direction: TicketViewNavigationDropDirection.Down,
                sectionId: 1,
                viewId: 3,
            },
        )

        expect(nextOrdering.views[2].display_order).toBe(0)
        expect(nextOrdering.view_sections[1].display_order).toBe(1)
        expect(nextOrdering.views[3].display_order).toBe(2)
        expect(nextOrdering.views[1].display_order).toBe(3)
        expect(nextOrdering.views[4].display_order).toBe(4)
        expect(nextOrdering.views[5].display_order).toBe(5)
        expect(nextOrdering.view_sections[2].display_order).toBe(6)
        expect(nextOrdering.views[6].display_order).toBe(7)
    })

    it('moves a section view to a root view', () => {
        const nextOrdering = createOrdering(
            { id: 4, type: elementTypes.view },
            {
                direction: TicketViewNavigationDropDirection.Up,
                sectionId: null,
                viewId: 2,
            },
        )

        expect(nextOrdering.views[1].display_order).toBe(0)
        expect(nextOrdering.views[4].display_order).toBe(1)
        expect(nextOrdering.views[2].display_order).toBe(2)
        expect(nextOrdering.view_sections[1].display_order).toBe(3)
        expect(nextOrdering.views[3].display_order).toBe(4)
        expect(nextOrdering.views[5].display_order).toBe(5)
        expect(nextOrdering.view_sections[2].display_order).toBe(6)
        expect(nextOrdering.views[6].display_order).toBe(7)
    })

    it('moves a section view to a section view', () => {
        const nextOrdering = createOrdering(
            { id: 3, type: elementTypes.view },
            {
                direction: TicketViewNavigationDropDirection.Down,
                sectionId: 1,
                viewId: 4,
            },
        )

        expect(nextOrdering.views[1].display_order).toBe(0)
        expect(nextOrdering.views[2].display_order).toBe(1)
        expect(nextOrdering.view_sections[1].display_order).toBe(2)
        expect(nextOrdering.views[4].display_order).toBe(3)
        expect(nextOrdering.views[3].display_order).toBe(4)
        expect(nextOrdering.views[5].display_order).toBe(5)
        expect(nextOrdering.view_sections[2].display_order).toBe(6)
        expect(nextOrdering.views[6].display_order).toBe(7)
    })

    it('moves a view to the top content boundary', () => {
        const nextOrdering = createOrdering(
            { id: 2, type: elementTypes.view },
            {
                direction: TicketViewNavigationDropDirection.Up,
                sectionId: null,
                viewId: null,
            },
        )

        expect(nextOrdering.views[2].display_order).toBe(0)
        expect(nextOrdering.views[1].display_order).toBe(1)
        expect(nextOrdering.view_sections[1].display_order).toBe(2)
        expect(nextOrdering.views[3].display_order).toBe(3)
        expect(nextOrdering.views[4].display_order).toBe(4)
        expect(nextOrdering.views[5].display_order).toBe(5)
        expect(nextOrdering.view_sections[2].display_order).toBe(6)
        expect(nextOrdering.views[6].display_order).toBe(7)
    })

    it('moves a view to the bottom content boundary', () => {
        const nextOrdering = createOrdering(
            { id: 2, type: elementTypes.view },
            {
                direction: TicketViewNavigationDropDirection.Down,
                sectionId: null,
                viewId: null,
            },
        )

        expect(nextOrdering.views[1].display_order).toBe(0)
        expect(nextOrdering.view_sections[1].display_order).toBe(1)
        expect(nextOrdering.views[3].display_order).toBe(2)
        expect(nextOrdering.views[4].display_order).toBe(3)
        expect(nextOrdering.views[5].display_order).toBe(4)
        expect(nextOrdering.view_sections[2].display_order).toBe(5)
        expect(nextOrdering.views[6].display_order).toBe(6)
        expect(nextOrdering.views[2].display_order).toBe(7)
    })

    it('moves a section above a root view', () => {
        const nextOrdering = createOrdering(
            { id: 1, type: elementTypes.section },
            {
                direction: TicketViewNavigationDropDirection.Up,
                sectionId: null,
                viewId: 2,
            },
        )

        expect(nextOrdering.views[1].display_order).toBe(0)
        expect(nextOrdering.view_sections[1].display_order).toBe(1)
        expect(nextOrdering.views[3].display_order).toBe(2)
        expect(nextOrdering.views[4].display_order).toBe(3)
        expect(nextOrdering.views[5].display_order).toBe(4)
        expect(nextOrdering.views[2].display_order).toBe(5)
        expect(nextOrdering.view_sections[2].display_order).toBe(6)
        expect(nextOrdering.views[6].display_order).toBe(7)
    })

    it('moves a section above another section', () => {
        const nextOrdering = createOrdering(
            { id: 2, type: elementTypes.section },
            {
                direction: TicketViewNavigationDropDirection.Up,
                sectionId: 1,
                viewId: null,
            },
        )

        expect(nextOrdering.views[1].display_order).toBe(0)
        expect(nextOrdering.views[2].display_order).toBe(1)
        expect(nextOrdering.view_sections[2].display_order).toBe(2)
        expect(nextOrdering.views[6].display_order).toBe(3)
        expect(nextOrdering.view_sections[1].display_order).toBe(4)
        expect(nextOrdering.views[3].display_order).toBe(5)
        expect(nextOrdering.views[4].display_order).toBe(6)
        expect(nextOrdering.views[5].display_order).toBe(7)
    })

    it('preserves child ordering when moving a section', () => {
        const sectionWithOutOfIdOrderChildren = [
            {
                data: viewsById[1],
                type: elementTypes.view,
            },
            {
                children: [viewsById[6]],
                data: sectionsById[2],
                type: elementTypes.section,
            },
            {
                children: [viewsById[5], viewsById[3], viewsById[4]],
                data: sectionsById[1],
                type: elementTypes.section,
            },
        ] satisfies TicketViewNavigationElement<
            TestView,
            TestSection,
            typeof elementTypes.view,
            typeof elementTypes.section
        >[]

        const nextOrdering = createNextTicketViewNavigationOrdering({
            dropResult: {
                direction: TicketViewNavigationDropDirection.Up,
                sectionId: 2,
                viewId: null,
            },
            elementTypes,
            item: { id: 1, type: elementTypes.section },
            orderedElements: sectionWithOutOfIdOrderChildren,
            sectionsById,
            viewsById,
        })

        expect(nextOrdering.views[1].display_order).toBe(0)
        expect(nextOrdering.view_sections[1].display_order).toBe(1)
        expect(nextOrdering.views[5].display_order).toBe(2)
        expect(nextOrdering.views[3].display_order).toBe(3)
        expect(nextOrdering.views[4].display_order).toBe(4)
        expect(nextOrdering.view_sections[2].display_order).toBe(5)
        expect(nextOrdering.views[6].display_order).toBe(6)
    })

    it('moves a section to the top content boundary', () => {
        const nextOrdering = createOrdering(
            { id: 1, type: elementTypes.section },
            {
                direction: TicketViewNavigationDropDirection.Up,
                sectionId: null,
                viewId: null,
            },
        )

        expect(nextOrdering.view_sections[1].display_order).toBe(0)
        expect(nextOrdering.views[3].display_order).toBe(1)
        expect(nextOrdering.views[4].display_order).toBe(2)
        expect(nextOrdering.views[5].display_order).toBe(3)
        expect(nextOrdering.views[1].display_order).toBe(4)
        expect(nextOrdering.views[2].display_order).toBe(5)
        expect(nextOrdering.view_sections[2].display_order).toBe(6)
        expect(nextOrdering.views[6].display_order).toBe(7)
    })

    it('moves a section to the bottom content boundary', () => {
        const nextOrdering = createOrdering(
            { id: 1, type: elementTypes.section },
            {
                direction: TicketViewNavigationDropDirection.Down,
                sectionId: null,
                viewId: null,
            },
        )

        expect(nextOrdering.views[1].display_order).toBe(0)
        expect(nextOrdering.views[2].display_order).toBe(1)
        expect(nextOrdering.view_sections[2].display_order).toBe(2)
        expect(nextOrdering.views[6].display_order).toBe(3)
        expect(nextOrdering.view_sections[1].display_order).toBe(4)
        expect(nextOrdering.views[3].display_order).toBe(5)
        expect(nextOrdering.views[4].display_order).toBe(6)
        expect(nextOrdering.views[5].display_order).toBe(7)
    })

    it('moves a view onto a section header with down direction as the first child', () => {
        const nextOrdering = createOrdering(
            { id: 1, type: elementTypes.view },
            {
                direction: TicketViewNavigationDropDirection.Down,
                sectionId: 1,
                viewId: null,
            },
        )

        expect(nextOrdering.views[2].display_order).toBe(0)
        expect(nextOrdering.view_sections[1].display_order).toBe(1)
        expect(nextOrdering.views[1].display_order).toBe(2)
        expect(nextOrdering.views[3].display_order).toBe(3)
        expect(nextOrdering.views[4].display_order).toBe(4)
        expect(nextOrdering.views[5].display_order).toBe(5)
        expect(nextOrdering.view_sections[2].display_order).toBe(6)
        expect(nextOrdering.views[6].display_order).toBe(7)
    })
})
