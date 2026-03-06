import { shortcutManager } from '@repo/utils'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateTagHandler,
    mockListTagsHandler,
    mockTag,
    mockTicketTag,
} from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { TagsMultiSelect } from './TagsMultiSelect'

vi.mock('@repo/utils', async () => {
    const actual = await vi.importActual('@repo/utils')
    return {
        ...actual,
        useShortcuts: vi.fn(),
    }
})

const tag1 = mockTag({ id: 1, name: 'Bug', decoration: { color: 'red' } })
const tag2 = mockTag({ id: 2, name: 'Feature', decoration: null })
const allTags = [tag1, tag2]

const mockTicketTags = [
    mockTicketTag({ id: 1, name: 'Bug', decoration: { color: 'red' } }),
    mockTicketTag({ id: 2, name: 'Feature', decoration: null }),
]

const emptyListResponse = {
    data: [],
    meta: {
        total_resources: 0,
        prev_cursor: null,
        next_cursor: null,
    },
}

const populatedListResponse = {
    data: allTags,
    meta: {
        total_resources: allTags.length,
        prev_cursor: null,
        next_cursor: null,
    },
}

const mockListTags = mockListTagsHandler(async ({ data }) =>
    HttpResponse.json({ ...data, ...populatedListResponse }),
)

const mockListTagsSearchAware = mockListTagsHandler(
    async ({ data, request }) => {
        const url = new URL(request.url)
        const search = url.searchParams.get('search') || ''

        if (search) {
            return HttpResponse.json({ ...data, ...emptyListResponse })
        }

        return HttpResponse.json({ ...data, ...populatedListResponse })
    },
)

const mockCreateTag = mockCreateTagHandler()

const localHandlers = [mockListTags.handler, mockCreateTag.handler]

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
    testAppQueryClient.clear()
})

afterEach(async () => {
    await testAppQueryClient.cancelQueries()
    testAppQueryClient.clear()
    server.resetHandlers(...localHandlers)
})

afterAll(() => {
    server.close()
})

const waitForQueriesSettled = async () => {
    await waitFor(
        () => {
            expect(testAppQueryClient.isFetching()).toBe(0)
        },
        { timeout: 3000 },
    )
}

const getTagsTriggerButton = () => {
    return screen
        .getAllByRole('button', { hidden: true })
        .find((button) => button.getAttribute('aria-haspopup') === 'listbox')!
}

const openTagsMenu = async (user: ReturnType<typeof render>['user']) => {
    if (getTagsTriggerButton().getAttribute('aria-expanded') !== 'true') {
        await user.click(getTagsTriggerButton())
    }

    await waitFor(() => {
        expect(getTagsTriggerButton()).toHaveAttribute('aria-expanded', 'true')
    })
}

const closeTagsMenu = async (user: ReturnType<typeof render>['user']) => {
    if (getTagsTriggerButton().getAttribute('aria-expanded') !== 'false') {
        await user.click(getTagsTriggerButton())
    }

    await waitFor(() => {
        expect(getTagsTriggerButton()).toHaveAttribute('aria-expanded', 'false')
    })

    await waitFor(() => {
        expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    })
}

describe('TagsMultiSelect', () => {
    it('renders correctly with selected tags', async () => {
        render(<TagsMultiSelect value={mockTicketTags} onChange={vi.fn()} />)

        await waitForQueriesSettled()

        expect(screen.getAllByText('Bug')[0]).toBeInTheDocument()
        expect(screen.getAllByText('Feature')[0]).toBeInTheDocument()
    })

    it('renders add tags button when no tags are selected', async () => {
        render(<TagsMultiSelect value={[]} onChange={vi.fn()} />)

        await waitForQueriesSettled()

        expect(
            screen.getByRole('button', { name: /add tags/i }),
        ).toBeInTheDocument()
    })

    it('calls onChange with remaining tags when close button is clicked', async () => {
        const onChange = vi.fn()

        const { user } = render(
            <TagsMultiSelect value={mockTicketTags} onChange={onChange} />,
        )

        await waitForQueriesSettled()

        const closeTags = await screen.findAllByRole('button', {
            name: /remove tag/i,
        })
        await user.click(closeTags[0])

        expect(onChange).toHaveBeenCalledWith([mockTicketTags[1]])
    })

    describe('Create tag', () => {
        it('should show create button when search returns no results', async () => {
            server.use(mockListTagsSearchAware.handler)

            const { user } = render(
                <TagsMultiSelect value={[]} onChange={vi.fn()} />,
            )

            await waitForQueriesSettled()

            await user.click(screen.getByRole('button', { name: /add tags/i }))

            await waitFor(() => {
                expect(screen.getByRole('searchbox')).toBeInTheDocument()
            })

            await user.type(screen.getByRole('searchbox'), 'NewTag')

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /create tag/i }),
                ).toBeInTheDocument()
            })

            await waitForQueriesSettled()
        })

        it('should not show create button when search is empty', async () => {
            server.use(mockListTagsSearchAware.handler)

            const { user } = render(
                <TagsMultiSelect value={[]} onChange={vi.fn()} />,
            )

            await waitForQueriesSettled()

            await user.click(screen.getByRole('button', { name: /add tags/i }))

            await waitFor(() => {
                expect(screen.getByRole('searchbox')).toBeInTheDocument()
            })

            expect(
                screen.queryByRole('button', { name: /create tag/i }),
            ).not.toBeInTheDocument()

            await waitForQueriesSettled()
        })

        it('should not show create button when results exist', async () => {
            const { user } = render(
                <TagsMultiSelect value={[]} onChange={vi.fn()} />,
            )

            await waitForQueriesSettled()

            await user.click(screen.getByRole('button', { name: /add tags/i }))

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: 'Bug' }),
                ).toBeInTheDocument()
            })

            expect(
                screen.queryByRole('button', { name: /create tag/i }),
            ).not.toBeInTheDocument()

            await waitForQueriesSettled()
        })

        it('should call onChange with new tag after creation', async () => {
            const createdTag = mockTag({
                id: 100,
                name: 'NewTag',
                decoration: null,
            })

            const mockCreateTagCustom = mockCreateTagHandler(async () =>
                HttpResponse.json(createdTag),
            )

            server.use(
                mockListTagsSearchAware.handler,
                mockCreateTagCustom.handler,
            )

            const onChange = vi.fn()
            const { user } = render(
                <TagsMultiSelect value={mockTicketTags} onChange={onChange} />,
            )

            await waitForQueriesSettled()

            await openTagsMenu(user)

            await screen.findByRole('searchbox', {}, { timeout: 3000 })

            await user.type(screen.getByRole('searchbox'), 'NewTag')

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /create tag/i }),
                ).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', { name: /create tag/i }),
            )

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledWith(
                    expect.arrayContaining([
                        expect.objectContaining({ id: 1, name: 'Bug' }),
                        expect.objectContaining({ id: 2, name: 'Feature' }),
                        expect.objectContaining({
                            id: 100,
                            name: 'NewTag',
                        }),
                    ]),
                )
            })

            await waitForQueriesSettled()
        })
    })

    it('should clear search field when menu is closed and reopened', async () => {
        server.use(mockListTagsSearchAware.handler)

        const { user } = render(
            <TagsMultiSelect value={mockTicketTags} onChange={vi.fn()} />,
        )

        await waitForQueriesSettled()

        await openTagsMenu(user)
        const searchInput = await screen.findByRole(
            'searchbox',
            {},
            {
                timeout: 3000,
            },
        )
        await user.type(searchInput, 'NewTag')
        expect(searchInput).toHaveValue('NewTag')

        await closeTagsMenu(user)

        await openTagsMenu(user)
        expect(
            await screen.findByRole('searchbox', {}, { timeout: 3000 }),
        ).toHaveValue('')

        await waitForQueriesSettled()
    })

    it('should denylist TicketHeader shortcuts when tag menu opens and clear when it closes', async () => {
        const denylistSpy = vi.spyOn(shortcutManager, 'denylist')
        const clearSpy = vi.spyOn(shortcutManager, 'clear')

        const { user } = render(
            <TagsMultiSelect value={[]} onChange={vi.fn()} />,
        )

        await waitForQueriesSettled()

        await user.click(screen.getByRole('button', { name: /add tags/i }))

        await waitFor(() => {
            expect(screen.getByRole('searchbox')).toBeInTheDocument()
        })

        expect(denylistSpy).toHaveBeenCalledWith(['TicketHeader'])

        await user.keyboard('{Escape}')

        await waitFor(() => {
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
        })

        expect(clearSpy).toHaveBeenCalledWith(['TicketHeader'])

        denylistSpy.mockRestore()
        clearSpy.mockRestore()
    })

    it('sorts selected tags alphabetically instead of by id', async () => {
        const tagsWithNameOrderDifferentFromId = [
            mockTag({ id: 1, name: 'Zulu', decoration: null }),
            mockTag({ id: 2, name: 'Alpha', decoration: null }),
        ]

        const mockListTagsNameSorted = mockListTagsHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                data: tagsWithNameOrderDifferentFromId,
                meta: {
                    total_resources: tagsWithNameOrderDifferentFromId.length,
                    prev_cursor: null,
                    next_cursor: null,
                },
            }),
        )

        server.use(mockListTagsNameSorted.handler)

        const onChange = vi.fn()
        const { user } = render(
            <TagsMultiSelect
                value={[
                    mockTicketTag({
                        id: 1,
                        name: 'Zulu',
                        decoration: null,
                    }),
                ]}
                onChange={onChange}
            />,
        )

        await waitForQueriesSettled()

        await openTagsMenu(user)

        await waitFor(() => {
            expect(
                screen.getByRole('option', { name: 'Alpha' }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('option', { name: 'Alpha' }))

        expect(onChange).toHaveBeenCalledTimes(1)

        const updatedTags = onChange.mock.calls[0][0] as Array<{
            name: string
        }>
        expect(updatedTags.map((tag) => tag.name)).toEqual(['Alpha', 'Zulu'])
    })

    it('allows selecting a tag from the dropdown and removing it', async () => {
        const onChange = vi.fn()

        const { user, rerender } = render(
            <TagsMultiSelect value={[mockTicketTags[0]]} onChange={onChange} />,
        )

        await waitForQueriesSettled()

        await openTagsMenu(user)

        await waitFor(() => {
            expect(
                screen.getByRole('option', { name: 'Feature' }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('option', { name: 'Feature' }))

        expect(onChange).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ id: 1, name: 'Bug' }),
                expect.objectContaining({ id: 2, name: 'Feature' }),
            ]),
        )

        await user.keyboard('{Escape}')
        onChange.mockClear()
        rerender(<TagsMultiSelect value={mockTicketTags} onChange={onChange} />)

        const closeTags = await screen.findAllByRole('button', {
            name: /remove tag/i,
        })
        await user.click(closeTags[0])

        expect(onChange).toHaveBeenCalledWith([mockTicketTags[1]])
    })
})
