import {
    createTicketViewNavigationDropUpdate,
    TicketViewNavigationDropDirection,
} from '..'
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

describe('createTicketViewNavigationDropUpdate', () => {
    const viewsById = {
        1: createView(1),
        2: createView(2, 10),
    }
    const sectionsById = {
        10: createSection(10),
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
            children: [viewsById[2]],
            data: sectionsById[10],
            type: elementTypes.section,
        },
    ]

    it('returns current element, next view section, and ordering for a section drop', () => {
        const update = createTicketViewNavigationDropUpdate({
            dropResult: {
                direction: TicketViewNavigationDropDirection.Down,
                sectionId: 10,
                viewId: null,
            },
            elementTypes,
            item: {
                id: 1,
                type: elementTypes.view,
            },
            orderedElements,
            sectionsById,
            viewsById,
        })

        expect(update.currentElement).toEqual({
            data: viewsById[1],
            type: elementTypes.view,
        })
        expect(update.nextElement).toEqual({
            data: {
                ...viewsById[1],
                section_id: 10,
            },
            type: elementTypes.view,
        })
        expect(update.nextOrdering).toEqual({
            view_sections: {
                10: { display_order: 0 },
            },
            views: {
                1: { display_order: 1 },
                2: { display_order: 2 },
            },
        })
    })

    it('keeps a view root-level when dropping above a section header', () => {
        const update = createTicketViewNavigationDropUpdate({
            dropResult: {
                direction: TicketViewNavigationDropDirection.Up,
                sectionId: 10,
                viewId: null,
            },
            elementTypes,
            item: {
                id: 1,
                type: elementTypes.view,
            },
            orderedElements,
            sectionsById,
            viewsById,
        })

        expect(update.nextElement).toEqual({
            data: {
                ...viewsById[1],
                section_id: null,
            },
            type: elementTypes.view,
        })
    })

    it('keeps a view root-level when dropping on the bottom content boundary', () => {
        const update = createTicketViewNavigationDropUpdate({
            dropResult: {
                direction: TicketViewNavigationDropDirection.Down,
                sectionId: null,
                viewId: null,
            },
            elementTypes,
            item: {
                id: 2,
                type: elementTypes.view,
            },
            orderedElements,
            sectionsById,
            viewsById,
        })

        expect(update.nextElement).toEqual({
            data: {
                ...viewsById[2],
                section_id: null,
            },
            type: elementTypes.view,
        })
    })

    it('sets the next view section when dropping next to a section child', () => {
        const update = createTicketViewNavigationDropUpdate({
            dropResult: {
                direction: TicketViewNavigationDropDirection.Down,
                sectionId: 10,
                viewId: 2,
            },
            elementTypes,
            item: {
                id: 1,
                type: elementTypes.view,
            },
            orderedElements,
            sectionsById,
            viewsById,
        })

        expect(update.nextElement).toEqual({
            data: {
                ...viewsById[1],
                section_id: 10,
            },
            type: elementTypes.view,
        })
    })

    it('returns a moved section with its current child ordering', () => {
        const childViewsById = {
            3: createView(3, 10),
            4: createView(4, 10),
            5: createView(5, 10),
        }
        const sectionChildrenOutOfIdOrder = [
            childViewsById[5],
            childViewsById[3],
            childViewsById[4],
        ]
        const update = createTicketViewNavigationDropUpdate({
            dropResult: {
                direction: TicketViewNavigationDropDirection.Down,
                sectionId: null,
                viewId: 1,
            },
            elementTypes,
            item: {
                id: 10,
                type: elementTypes.section,
            },
            orderedElements: [
                {
                    data: viewsById[1],
                    type: elementTypes.view,
                },
                {
                    children: sectionChildrenOutOfIdOrder,
                    data: sectionsById[10],
                    type: elementTypes.section,
                },
            ],
            sectionsById,
            viewsById: {
                ...viewsById,
                ...childViewsById,
            },
        })

        expect(update.currentElement).toEqual({
            children: sectionChildrenOutOfIdOrder,
            data: sectionsById[10],
            type: elementTypes.section,
        })
    })

    it('reconstructs a moved section from maps when the section is missing from ordered elements', () => {
        const childViewsById = {
            3: createView(3, 10),
            4: createView(4, 10),
        }
        const update = createTicketViewNavigationDropUpdate({
            dropResult: {
                direction: TicketViewNavigationDropDirection.Down,
                sectionId: null,
                viewId: 1,
            },
            elementTypes,
            item: {
                id: 10,
                type: elementTypes.section,
            },
            orderedElements: [
                {
                    data: viewsById[1],
                    type: elementTypes.view,
                },
            ],
            sectionsById,
            viewsById: {
                ...viewsById,
                ...childViewsById,
            },
        })

        expect(update.currentElement).toEqual({
            children: [viewsById[2], childViewsById[3], childViewsById[4]],
            data: sectionsById[10],
            type: elementTypes.section,
        })
        expect(update.nextElement).toEqual(update.currentElement)
        expect(update.nextOrdering).toEqual({
            view_sections: {
                10: { display_order: 1 },
            },
            views: {
                1: { display_order: 0 },
                2: { display_order: 2 },
                3: { display_order: 3 },
                4: { display_order: 4 },
            },
        })
    })
})
