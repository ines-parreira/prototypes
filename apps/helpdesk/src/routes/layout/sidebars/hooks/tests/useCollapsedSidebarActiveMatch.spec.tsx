import { renderHook } from '@repo/testing'
import { MemoryRouter } from 'react-router-dom'

import { useCollapsedSidebarActiveMatch } from '../useCollapsedSidebarActiveMatch'

type TestItem = { id: string; path: string }

const mockSections = [
    {
        id: 'section-a',
        items: [
            { id: '/app/workflows/rules', path: '/app/workflows/rules' },
            { id: '/app/workflows/macros', path: '/app/workflows/macros' },
        ],
    },
    {
        id: 'section-b',
        items: [{ id: '/app/workflows/tags', path: '/app/workflows/tags' }],
    },
]

const renderHookWithRoute = (route: string) =>
    renderHook(
        () =>
            useCollapsedSidebarActiveMatch(
                mockSections,
                (item: TestItem) => item.path,
            ),
        {
            wrapper: ({ children }) => (
                <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            ),
        },
    )

describe('useCollapsedSidebarActiveMatch', () => {
    it('returns undefined when pathname matches no item', () => {
        const { result } = renderHookWithRoute('/app/workflows/unknown')

        expect(result.current).toBeUndefined()
    })

    it('returns sectionId and itemId when pathname matches an item in the first section', () => {
        const { result } = renderHookWithRoute('/app/workflows/rules')

        expect(result.current).toEqual({
            sectionId: 'section-a',
            itemId: '/app/workflows/rules',
        })
    })

    it('returns sectionId and itemId for a second item in the first section', () => {
        const { result } = renderHookWithRoute('/app/workflows/macros')

        expect(result.current).toEqual({
            sectionId: 'section-a',
            itemId: '/app/workflows/macros',
        })
    })

    it('returns the correct section for a match in the second section', () => {
        const { result } = renderHookWithRoute('/app/workflows/tags')

        expect(result.current).toEqual({
            sectionId: 'section-b',
            itemId: '/app/workflows/tags',
        })
    })

    it('returns the first matching section when multiple sections could match', () => {
        const overlappingSections = [
            {
                id: 'first',
                items: [
                    {
                        id: '/app/workflows/rules',
                        path: '/app/workflows/rules',
                    },
                ],
            },
            {
                id: 'second',
                items: [
                    {
                        id: '/app/workflows/rules',
                        path: '/app/workflows/rules',
                    },
                ],
            },
        ]

        const { result } = renderHook(
            () =>
                useCollapsedSidebarActiveMatch(
                    overlappingSections,
                    (item: TestItem) => item.path,
                ),
            {
                wrapper: ({ children }) => (
                    <MemoryRouter initialEntries={['/app/workflows/rules']}>
                        {children}
                    </MemoryRouter>
                ),
            },
        )

        expect(result.current?.sectionId).toBe('first')
    })

    it('returns undefined when all sections have empty items arrays', () => {
        const emptySections = [{ id: 'empty', items: [] }]

        const { result } = renderHook(
            () =>
                useCollapsedSidebarActiveMatch(
                    emptySections,
                    (item: TestItem) => item.path,
                ),
            {
                wrapper: ({ children }) => (
                    <MemoryRouter initialEntries={['/app/workflows/rules']}>
                        {children}
                    </MemoryRouter>
                ),
            },
        )

        expect(result.current).toBeUndefined()
    })

    it('returns undefined when sections have undefined items', () => {
        const sectionsWithoutItems = [{ id: 'no-items' }]

        const { result } = renderHook(
            () =>
                useCollapsedSidebarActiveMatch(
                    sectionsWithoutItems,
                    (item: TestItem) => item.path,
                ),
            {
                wrapper: ({ children }) => (
                    <MemoryRouter initialEntries={['/app/workflows/rules']}>
                        {children}
                    </MemoryRouter>
                ),
            },
        )

        expect(result.current).toBeUndefined()
    })
})
