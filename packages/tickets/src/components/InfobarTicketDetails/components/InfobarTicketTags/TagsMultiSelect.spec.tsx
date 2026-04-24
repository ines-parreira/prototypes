import { shortcutManager } from '@repo/utils'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateTagHandler,
    mockListTagsHandler,
    mockTag,
    mockTicketTag,
} from '@gorgias/helpdesk-mocks'

import { render } from '../../../../tests/render.utils'
import type { TagsMultiSelectProps } from './TagsMultiSelect'
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
})

afterEach(async () => {
    if (vi.isFakeTimers()) {
        await vi.runOnlyPendingTimersAsync()
        vi.useRealTimers()
    }
    await waitForTriggerReady()
    server.resetHandlers(...localHandlers)
})

afterAll(() => {
    server.close()
})

const waitForTriggerReady = async () => {
    await waitFor(() => {
        expect(getTagsTriggerButton()).toBeInTheDocument()
    })
}

const renderTagsMultiSelect = (props: TagsMultiSelectProps) =>
    render(<TagsMultiSelect {...props} />)

const flushSearchDebounce = async () => {
    await vi.advanceTimersByTimeAsync(300)
}

const setupFakeTimersUser = () =>
    userEvent.setup({
        advanceTimers: vi.advanceTimersByTime,
    })

const flushPendingTimersIfNeeded = async () => {
    if (vi.isFakeTimers()) {
        await vi.runOnlyPendingTimersAsync()
    }
}

const getTagsTriggerButton = () => {
    return screen
        .getAllByRole('button', { hidden: true })
        .find((button) => button.getAttribute('aria-haspopup') === 'listbox')!
}

const queryOpenTagsPopupElement = (role: 'listbox' | 'searchbox') => {
    return screen
        .queryAllByRole(role, { hidden: true })
        .find(
            (element) =>
                element.closest('template') === null &&
                element.closest('[data-testid="hidden-select-container"]') ===
                    null,
        )
}

const findOpenTagsPopupElement = async (role: 'listbox' | 'searchbox') => {
    return waitFor(() => {
        const element = queryOpenTagsPopupElement(role)

        expect(getTagsTriggerButton()).toHaveAttribute('aria-expanded', 'true')
        expect(element).toBeVisible()

        return element!
    })
}

const openTagsMenu = async (user: ReturnType<typeof render>['user']) => {
    const triggerButton = getTagsTriggerButton()

    if (triggerButton.getAttribute('aria-expanded') !== 'true') {
        await user.click(triggerButton)
        await flushPendingTimersIfNeeded()
    }

    try {
        const listbox = await findOpenTagsPopupElement('listbox')
        const searchbox = await findOpenTagsPopupElement('searchbox')

        return { listbox, searchbox }
    } catch {
        await user.click(triggerButton)
        await flushPendingTimersIfNeeded()

        const listbox = await findOpenTagsPopupElement('listbox')
        const searchbox = await findOpenTagsPopupElement('searchbox')

        return { listbox, searchbox }
    }
}

const closeTagsMenu = async (user: ReturnType<typeof render>['user']) => {
    const assertClosed = () => {
        expect(getTagsTriggerButton()).toHaveAttribute('aria-expanded', 'false')
        expect(queryOpenTagsPopupElement('listbox')).toBeUndefined()
        expect(queryOpenTagsPopupElement('searchbox')).toBeUndefined()
    }

    try {
        await user.keyboard('{Escape}')
        await flushPendingTimersIfNeeded()

        await waitFor(assertClosed)
    } catch {
        await user.click(getTagsTriggerButton())
        await flushPendingTimersIfNeeded()

        await waitFor(assertClosed)
    }
}

describe('TagsMultiSelect', () => {
    it('renders correctly with selected tags', async () => {
        renderTagsMultiSelect({ value: mockTicketTags, onChange: vi.fn() })

        await waitForTriggerReady()

        expect(screen.getAllByText('Bug')[0]).toBeInTheDocument()
        expect(screen.getAllByText('Feature')[0]).toBeInTheDocument()
    })

    it('renders add tags button when no tags are selected', async () => {
        renderTagsMultiSelect({ value: [], onChange: vi.fn() })

        await waitForTriggerReady()

        expect(
            screen.getByRole('button', { name: /add tags/i }),
        ).toBeInTheDocument()
    })

    it('calls onChange with remaining tags when close button is clicked', async () => {
        const onChange = vi.fn()

        const { user } = renderTagsMultiSelect({
            value: mockTicketTags,
            onChange,
        })

        await waitForTriggerReady()

        const closeTags = await screen.findAllByRole('button', {
            name: /remove tag/i,
        })
        await user.click(closeTags[0])

        expect(onChange).toHaveBeenCalledWith([mockTicketTags[1]])
    })

    describe('Create tag', () => {
        it('should show create button when search returns no results', async () => {
            server.use(mockListTagsSearchAware.handler)
            vi.useFakeTimers({ shouldAdvanceTime: true })

            renderTagsMultiSelect({
                value: [],
                onChange: vi.fn(),
            })
            const user = setupFakeTimersUser()

            await waitForTriggerReady()

            const { searchbox } = await openTagsMenu(user)

            await user.type(searchbox, 'NewTag')
            await flushSearchDebounce()

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /create tag/i }),
                ).toBeInTheDocument()
            })

            await waitForTriggerReady()
        })

        it('should not show create button when search is empty', async () => {
            server.use(mockListTagsSearchAware.handler)

            const { user } = renderTagsMultiSelect({
                value: [],
                onChange: vi.fn(),
            })

            await waitForTriggerReady()

            await openTagsMenu(user)

            expect(
                screen.queryByRole('button', { name: /create tag/i }),
            ).not.toBeInTheDocument()

            await waitForTriggerReady()
        })

        it('should not show create button when results exist', async () => {
            const { user } = renderTagsMultiSelect({
                value: [],
                onChange: vi.fn(),
            })

            await waitForTriggerReady()

            await user.click(screen.getByRole('button', { name: /add tags/i }))

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: 'Bug' }),
                ).toBeInTheDocument()
            })

            expect(
                screen.queryByRole('button', { name: /create tag/i }),
            ).not.toBeInTheDocument()

            await waitForTriggerReady()
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
            vi.useFakeTimers({ shouldAdvanceTime: true })

            const onChange = vi.fn()
            renderTagsMultiSelect({
                value: mockTicketTags,
                onChange,
            })
            const user = setupFakeTimersUser()

            await waitForTriggerReady()

            const { searchbox } = await openTagsMenu(user)
            await user.type(searchbox, 'NewTag')
            await flushSearchDebounce()

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

            await waitForTriggerReady()
        })

        it('should show error toast when tag creation fails', async () => {
            const mockCreateTagFailing = mockCreateTagHandler(
                async () => new HttpResponse(null, { status: 500 }) as any,
            )

            server.use(
                mockListTagsSearchAware.handler,
                mockCreateTagFailing.handler,
            )
            vi.useFakeTimers({ shouldAdvanceTime: true })

            renderTagsMultiSelect({
                value: mockTicketTags,
                onChange: vi.fn(),
            })
            const user = setupFakeTimersUser()

            await waitForTriggerReady()

            const { searchbox } = await openTagsMenu(user)
            await user.type(searchbox, 'NewTag')
            await flushSearchDebounce()

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /create tag/i }),
                ).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', { name: /create tag/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Failed to create new tag',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })

            await waitForTriggerReady()
        })
    })

    it('should clear search field when menu is closed and reopened', async () => {
        server.use(mockListTagsSearchAware.handler)
        vi.useFakeTimers({ shouldAdvanceTime: true })

        renderTagsMultiSelect({
            value: mockTicketTags,
            onChange: vi.fn(),
        })
        const user = setupFakeTimersUser()

        await waitForTriggerReady()

        const { searchbox: searchInput } = await openTagsMenu(user)
        await user.type(searchInput, 'NewTag')
        await flushSearchDebounce()
        expect(searchInput).toHaveValue('NewTag')

        await closeTagsMenu(user)
        await waitForTriggerReady()

        const { searchbox: reopenedSearchbox } = await openTagsMenu(user)

        await waitFor(() => {
            expect(reopenedSearchbox).toHaveValue('')
            expect(
                screen.queryByRole('button', { name: /create tag/i }),
            ).not.toBeInTheDocument()
        })

        await waitForTriggerReady()
    })

    it('should denylist TicketHeader shortcuts when tag menu opens and clear when it closes', async () => {
        const denylistSpy = vi.spyOn(shortcutManager, 'denylist')
        const clearSpy = vi.spyOn(shortcutManager, 'clear')

        const { user } = renderTagsMultiSelect({
            value: [],
            onChange: vi.fn(),
        })

        await waitForTriggerReady()

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
        const { user } = renderTagsMultiSelect({
            value: [
                mockTicketTag({
                    id: 1,
                    name: 'Zulu',
                    decoration: null,
                }),
            ],
            onChange,
        })

        await waitForTriggerReady()

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

    it('displays tags in alphabetical order regardless of value prop order', async () => {
        const unorderedTags = [
            mockTicketTag({ id: 1, name: 'Zulu', decoration: null }),
            mockTicketTag({ id: 2, name: 'Alpha', decoration: null }),
            mockTicketTag({ id: 3, name: 'Mango', decoration: null }),
        ]

        renderTagsMultiSelect({ value: unorderedTags, onChange: vi.fn() })

        await waitForTriggerReady()

        const tagNames = screen
            .getAllByText(/^(Alpha|Mango|Zulu)$/)
            .map((el) => el.textContent)

        expect(tagNames).toEqual(['Alpha', 'Mango', 'Zulu'])
    })

    it('allows selecting a tag from the dropdown and removing it', async () => {
        const onChange = vi.fn()

        const { user, rerender } = renderTagsMultiSelect({
            value: [mockTicketTags[0]],
            onChange,
        })

        await waitForTriggerReady()

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
