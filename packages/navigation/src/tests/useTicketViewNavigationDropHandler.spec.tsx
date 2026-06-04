import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    TicketViewNavigationDropDirection,
    useTicketViewNavigationDropHandler,
} from '..'
import type {
    TicketViewNavigationElement,
    TicketViewNavigationSection,
    TicketViewNavigationView,
} from '../createTicketViewNavigationData'
import { ticketViewNavigationOrderingStore } from '../ticketViewNavigationOrderingStore'

type TestView = TicketViewNavigationView & {
    id: number
    name: string
    section_id: number | null
    visibility: 'private' | 'public'
}

type TestSection = TicketViewNavigationSection & {
    id: number
    name: string
    private: boolean
}

const elementTypes = {
    section: 'section',
    view: 'view',
} as const

const createView = (
    id: number,
    visibility: TestView['visibility'],
    section_id: number | null = null,
): TestView => ({
    category: 'user',
    id,
    name: `View ${id}`,
    section_id,
    type: 'ticket-list',
    visibility,
})

const createSection = (id: number, isPrivate: boolean): TestSection => ({
    id,
    name: `Section ${id}`,
    private: isPrivate,
})

describe('useTicketViewNavigationDropHandler', () => {
    const privateView = createView(1, 'private')
    const privateSection = createSection(10, true)
    const orderedElements: TicketViewNavigationElement<
        TestView,
        TestSection,
        typeof elementTypes.view,
        typeof elementTypes.section
    >[] = [
        {
            data: privateView,
            type: elementTypes.view,
        },
        {
            children: [],
            data: privateSection,
            type: elementTypes.section,
        },
    ]

    beforeEach(() => {
        ticketViewNavigationOrderingStore
            .getState()
            .resetOptimisticTicketViewNavigationOrdering()
    })

    it('handles private drop eligibility', () => {
        const { result } = renderHook(() =>
            useTicketViewNavigationDropHandler({
                elementTypes,
                isMovingItem: false,
                isPrivate: true,
                isPrivateSection: (section) => section.private,
                isPrivateView: (view) => view.visibility === 'private',
                onSubmitMoveItem: vi.fn(),
                onViewSectionChange: vi.fn(),
                orderedElements,
                sectionsById: {
                    [privateSection.id]: privateSection,
                    11: createSection(11, false),
                },
                viewsById: {
                    [privateView.id]: privateView,
                    2: createView(2, 'public'),
                },
            }),
        )

        expect(
            result.current.canDrop({
                id: privateView.id,
                type: elementTypes.view,
            }),
        ).toBe(true)
        expect(
            result.current.canDrop({
                id: 2,
                type: elementTypes.view,
            }),
        ).toBe(false)
        expect(
            result.current.canDrop({
                id: privateSection.id,
                type: elementTypes.section,
            }),
        ).toBe(true)
        expect(
            result.current.canDrop({
                id: 11,
                type: elementTypes.section,
            }),
        ).toBe(false)
    })

    it('updates optimistic ordering and reports section changes on drop', () => {
        const onSubmitMoveItem = vi.fn()
        const onViewSectionChange = vi.fn()
        const { result } = renderHook(() =>
            useTicketViewNavigationDropHandler({
                elementTypes,
                isMovingItem: false,
                isPrivate: true,
                isPrivateSection: (section) => section.private,
                isPrivateView: (view) => view.visibility === 'private',
                onSubmitMoveItem,
                onViewSectionChange,
                orderedElements,
                sectionsById: {
                    [privateSection.id]: privateSection,
                },
                viewsById: {
                    [privateView.id]: privateView,
                },
            }),
        )

        act(() => {
            result.current.handleDrop(
                {
                    id: privateView.id,
                    type: elementTypes.view,
                },
                {
                    direction: TicketViewNavigationDropDirection.Down,
                    sectionId: privateSection.id,
                    viewId: null,
                },
            )
        })

        const nextView = {
            ...privateView,
            section_id: privateSection.id,
        }
        expect(onViewSectionChange).toHaveBeenCalledWith(nextView)
        expect(onSubmitMoveItem).toHaveBeenCalledWith(
            {
                data: nextView,
                type: elementTypes.view,
            },
            {
                data: privateView,
                type: elementTypes.view,
            },
            expect.any(Object),
            true,
        )
        expect(
            ticketViewNavigationOrderingStore.getState()
                .optimisticPrivateOrdering.view_sections[privateSection.id]
                .display_order,
        ).toBe(0)
    })
})
