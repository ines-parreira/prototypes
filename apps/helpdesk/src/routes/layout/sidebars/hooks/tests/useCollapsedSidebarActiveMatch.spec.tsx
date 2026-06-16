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

    describe('with getSectionPath (route-only sections)', () => {
        const sectionsWithRoute = [
            { id: 'metrics-glossary', route: 'metrics-glossary' },
            {
                id: 'section-a',
                items: [{ id: '/app/stats/live', path: '/app/stats/live' }],
            },
        ]

        const getSectionPath = (section: { id: string; route?: string }) =>
            section.route ? `/app/stats/${section.route}` : undefined

        const renderWithSectionPath = (route: string) =>
            renderHook(
                () =>
                    useCollapsedSidebarActiveMatch(
                        sectionsWithRoute,
                        (item: TestItem) => item.path,
                        getSectionPath,
                    ),
                {
                    wrapper: ({ children }) => (
                        <MemoryRouter initialEntries={[route]}>
                            {children}
                        </MemoryRouter>
                    ),
                },
            )

        it('matches a route-only section by its section path, using the section id as itemId', () => {
            const { result } = renderWithSectionPath(
                '/app/stats/metrics-glossary',
            )

            expect(result.current).toEqual({
                sectionId: 'metrics-glossary',
                itemId: 'metrics-glossary',
            })
        })

        it('still matches item paths in other sections', () => {
            const { result } = renderWithSectionPath('/app/stats/live')

            expect(result.current).toEqual({
                sectionId: 'section-a',
                itemId: '/app/stats/live',
            })
        })

        it('returns undefined when neither an item nor a section route matches', () => {
            const { result } = renderWithSectionPath('/app/stats/unknown')

            expect(result.current).toBeUndefined()
        })

        it('prefers an item match over a section-path match within the same section', () => {
            const overlappingSections = [
                {
                    id: 'combo',
                    route: 'combo',
                    items: [
                        {
                            id: 'combo-item',
                            path: '/app/stats/combo/item',
                        },
                    ],
                },
            ]

            const { result } = renderHook(
                () =>
                    useCollapsedSidebarActiveMatch(
                        overlappingSections,
                        (item: TestItem) => item.path,
                        getSectionPath,
                    ),
                {
                    wrapper: ({ children }) => (
                        <MemoryRouter
                            initialEntries={['/app/stats/combo/item']}
                        >
                            {children}
                        </MemoryRouter>
                    ),
                },
            )

            expect(result.current).toEqual({
                sectionId: 'combo',
                itemId: 'combo-item',
            })
        })
    })
})
