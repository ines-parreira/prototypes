import { history } from '@repo/routing'
import { render } from '@repo/testing/vitest'
import { shortcutManager } from '@repo/utils'
import { act, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useRecentItems } from '../hooks/useRecentItems'
import { useSearchSpotlightData } from '../hooks/useSearchSpotlightData'
import { SearchSpotlightRoot } from './SearchSpotlightRoot'

function createPaginationState() {
    return {
        customers: {
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchNextPage: vi.fn(),
        },
        tickets: {
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchNextPage: vi.fn(),
        },
        calls: {
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchNextPage: vi.fn(),
        },
    }
}

function createSearchSpotlightDataMock() {
    return {
        isSearchMode: false,
        isLoading: false,
        customers: [],
        tickets: [],
        calls: [],
        totals: {
            customers: 2,
            tickets: 41,
            calls: 1,
        },
        pagination: createPaginationState(),
    }
}

function createCustomerSearchResult(id: number, name: string) {
    return {
        kind: 'customer' as const,
        id,
        raw: {
            id,
            name,
            email: `${name.toLowerCase().replaceAll(' ', '.')}@example.com`,
            phone: `+33${id}`,
        },
        url: `/app/customer/${id}`,
        name: { text: name },
        email: {
            text: `${name.toLowerCase().replaceAll(' ', '.')}@example.com`,
        },
        phone: { text: `+33${id}` },
    }
}

const setRecentCustomerItem = vi.fn()
const setRecentTicketItem = vi.fn()
const setRecentCallItem = vi.fn()

function resetRecentItemSetters() {
    setRecentCustomerItem.mockReset()
    setRecentTicketItem.mockReset()
    setRecentCallItem.mockReset()
}

vi.mock('../hooks/useSearchSpotlightData', () => ({
    useSearchSpotlightData: vi.fn(() => createSearchSpotlightDataMock()),
}))

vi.mock('../hooks/useRecentItems', () => ({
    useRecentItems: vi.fn().mockImplementation((tableName: string) => ({
        items:
            tableName === 'recent-customers'
                ? [
                      {
                          id: 101,
                          name: 'Ada Lovelace',
                          email: 'ada@example.com',
                          phone: '+3311111111',
                      },
                  ]
                : tableName === 'recent-tickets'
                  ? [
                        {
                            id: 202,
                            subject: 'Refund request',
                            status: 'open',
                            is_unread: true,
                            customer: { name: 'Ada Lovelace' },
                            assignee_user: { name: 'Morgan Agent' },
                            updated_datetime: '2026-04-20T10:00:00.000Z',
                        },
                    ]
                  : [
                        {
                            id: 303,
                            ticket_id: 202,
                            direction: 'inbound',
                            status: 'answered',
                            phone_number_source: '+3311111111',
                            updated_datetime: '2026-04-20T10:00:00.000Z',
                        },
                    ],
        isGettingItems: false,
        setRecentItem: vi.fn(),
    })),
}))

function createRecentItemsMockImplementation() {
    return (tableName: string) => ({
        items:
            tableName === 'recent-customers'
                ? [
                      {
                          id: 101,
                          name: 'Ada Lovelace',
                          email: 'ada@example.com',
                          phone: '+3311111111',
                      },
                  ]
                : tableName === 'recent-tickets'
                  ? [
                        {
                            id: 202,
                            subject: 'Refund request',
                            status: 'open',
                            is_unread: true,
                            customer: { name: 'Ada Lovelace' },
                            assignee_user: { name: 'Morgan Agent' },
                            updated_datetime: '2026-04-20T10:00:00.000Z',
                        },
                    ]
                  : [
                        {
                            id: 303,
                            ticket_id: 202,
                            direction: 'inbound',
                            status: 'answered',
                            phone_number_source: '+3311111111',
                            updated_datetime: '2026-04-20T10:00:00.000Z',
                        },
                    ],
        isGettingItems: false,
        setRecentItem:
            tableName === 'recent-customers'
                ? setRecentCustomerItem
                : tableName === 'recent-tickets'
                  ? setRecentTicketItem
                  : setRecentCallItem,
    })
}

beforeAll(() => {
    if (!Element.prototype.getAnimations) {
        Element.prototype.getAnimations = vi.fn(() => [])
    }
})

describe('SearchSpotlightRoot', () => {
    beforeEach(() => {
        localStorage.clear()
        resetRecentItemSetters()
        vi.mocked(useSearchSpotlightData).mockReturnValue(
            createSearchSpotlightDataMock(),
        )
        vi.mocked(useRecentItems).mockImplementation(
            createRecentItemsMockImplementation(),
        )
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('renders the large spotlight modal shell with grouped sections', () => {
        render(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        expect(
            screen.getByPlaceholderText('Search for anything...'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /advanced search/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Recently accessed customers'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Recently accessed tickets'),
        ).toBeInTheDocument()
        expect(screen.getByText('Recently accessed calls')).toBeInTheDocument()
        expect(screen.getAllByText('Ada Lovelace')).not.toHaveLength(0)
        expect(screen.queryByText(/open tickets/i)).not.toBeInTheDocument()
        expect(screen.queryByText('41')).not.toBeInTheDocument()
        expect(screen.queryByText('7')).not.toBeInTheDocument()
        expect(screen.getByText('Refund request')).toBeInTheDocument()
    })

    it('does not render stored highlights in the recent-items state', () => {
        vi.mocked(useRecentItems).mockImplementation((tableName: string) => ({
            items:
                tableName === 'recent-tickets'
                    ? [
                          {
                              id: 202,
                              subject: 'Refund request',
                              excerpt: 'Original excerpt',
                              status: 'open',
                              is_unread: true,
                              customer: { name: 'Ada Lovelace' },
                              highlights: {
                                  subject: ['<em>Refund</em> request'],
                                  messages: {
                                      body: ['Original <em>excerpt</em>'],
                                  },
                              },
                          },
                      ]
                    : [],
            isGettingItems: false,
            setRecentItem: vi.fn(),
        }))

        render(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        expect(screen.getByText('Refund request')).toBeInTheDocument()
        expect(screen.queryByText('Original excerpt')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Refund', { selector: 'em' }),
        ).not.toBeInTheDocument()
    })

    it('shows tab counts only in search mode', () => {
        vi.mocked(useSearchSpotlightData).mockReturnValue({
            ...createSearchSpotlightDataMock(),
            isSearchMode: true,
            totals: {
                customers: 7,
                tickets: 11,
                calls: 13,
            },
        })

        render(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        expect(screen.getByText('31')).toBeInTheDocument()
        expect(screen.getAllByText('7').length).toBeGreaterThan(0)
        expect(screen.getAllByText('11').length).toBeGreaterThan(0)
        expect(screen.getAllByText('13').length).toBeGreaterThan(0)
    })

    it('shows more-results links in all-mode search and switches tabs on click', async () => {
        const user = userEvent.setup()

        vi.mocked(useSearchSpotlightData).mockReturnValue({
            ...createSearchSpotlightDataMock(),
            isSearchMode: true,
            customers: [
                {
                    kind: 'customer',
                    id: 101,
                    raw: {
                        id: 101,
                        name: 'Ada Lovelace',
                        email: 'ada@example.com',
                        phone: '+3311111111',
                    },
                    url: '/app/customer/101',
                    name: { text: 'Ada Lovelace' },
                    email: { text: 'ada@example.com' },
                    phone: { text: '+3311111111' },
                },
                {
                    kind: 'customer',
                    id: 102,
                    raw: {
                        id: 102,
                        name: 'Grace Hopper',
                        email: 'grace@example.com',
                        phone: '+3322222222',
                    },
                    url: '/app/customer/102',
                    name: { text: 'Grace Hopper' },
                    email: { text: 'grace@example.com' },
                    phone: { text: '+3322222222' },
                },
                {
                    kind: 'customer',
                    id: 103,
                    raw: {
                        id: 103,
                        name: 'Katherine Johnson',
                        email: 'katherine@example.com',
                        phone: '+3333333333',
                    },
                    url: '/app/customer/103',
                    name: { text: 'Katherine Johnson' },
                    email: { text: 'katherine@example.com' },
                    phone: { text: '+3333333333' },
                },
            ],
            totals: {
                customers: 20,
                tickets: 0,
                calls: 0,
            },
        })

        render(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        const moreResultsLink = screen.getByRole('link', {
            name: 'More results',
        })

        expect(moreResultsLink).toBeInTheDocument()
        expect(screen.getByText('17')).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: /tickets/i }),
        ).toBeInTheDocument()

        await user.click(moreResultsLink)

        expect(
            screen.getByRole('radio', { name: /customers/i }),
        ).toHaveAttribute('aria-checked', 'true')
        expect(
            screen.queryByRole('link', { name: 'More results' }),
        ).not.toBeInTheDocument()
    })

    it('renders highlighted visible and hidden search matches for ticket rows', () => {
        vi.mocked(useSearchSpotlightData).mockReturnValue({
            ...createSearchSpotlightDataMock(),
            isSearchMode: true,
            tickets: [
                {
                    kind: 'ticket',
                    id: 202,
                    raw: {
                        id: 202,
                    },
                    url: '/app/ticket/202',
                    subject: {
                        text: 'Refund request',
                    },
                    hiddenMatch: {
                        text: 'Original excerpt',
                        highlightedHtml: 'Original <em>excerpt</em>',
                    },
                    customerName: {
                        text: 'Ada Lovelace',
                        highlightedHtml: '<em>Ada</em> Lovelace',
                    },
                    statusLabel: 'Open',
                    statusColor: 'purple',
                    isUnread: true,
                    activityLabel: '4 d ago by',
                    agentName: 'Morgan Agent',
                },
            ],
            totals: {
                customers: 0,
                tickets: 1,
                calls: 0,
            },
        })

        render(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        expect(
            screen.getAllByText(
                (_, element) => element?.textContent === 'Ada Lovelace',
            ).length,
        ).toBeGreaterThan(0)
        expect(
            screen.getAllByText(
                (_, element) => element?.textContent === 'Original excerpt',
            ).length,
        ).toBeGreaterThan(0)
    })

    it('falls back to the customer id when a customer has no name', () => {
        vi.mocked(useRecentItems).mockImplementation((tableName: string) => ({
            items:
                tableName === 'recent-customers'
                    ? [
                          {
                              id: 1015172570,
                              name: '',
                              email: '',
                              phone: '',
                          },
                      ]
                    : [],
            isGettingItems: false,
            setRecentItem: vi.fn(),
        }))

        render(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        expect(screen.getByText('Customer #1015172570')).toBeInTheDocument()
    })

    it('does not close immediately when opened', () => {
        const onClose = vi.fn()

        render(<SearchSpotlightRoot isOpen={true} onClose={onClose} />)

        expect(onClose).not.toHaveBeenCalled()
    })

    it('closes before navigating to advanced search', async () => {
        const user = userEvent.setup()
        const events: string[] = []
        const onClose = vi.fn(() => {
            events.push('close')
        })

        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
            (callback: FrameRequestCallback) => {
                events.push('raf')
                callback(0)
                return 1
            },
        )

        vi.spyOn(history, 'push').mockImplementation((location) => {
            events.push('push')
            expect(location).toEqual({
                pathname: '/app/tickets/search',
                search: '',
            })
        })

        render(<SearchSpotlightRoot isOpen={true} onClose={onClose} />)

        await user.click(
            screen.getByRole('button', { name: /advanced search/i }),
        )

        expect(onClose).toHaveBeenCalledTimes(1)
        expect(history.push).toHaveBeenCalledTimes(1)
        expect(events).toContain('raf')
        expect(events.indexOf('close')).toBeLessThan(events.indexOf('push'))
    })

    it('runs the advanced-search shortcut outside the calls tab', () => {
        const onClose = vi.fn()
        const bindSpy = vi.spyOn(shortcutManager, 'bind')

        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
            (callback: FrameRequestCallback) => {
                callback(0)
                return 1
            },
        )
        vi.spyOn(history, 'push').mockImplementation(vi.fn())

        render(<SearchSpotlightRoot isOpen={true} onClose={onClose} />)

        const bindings = bindSpy.mock.calls.find(
            ([scope]) => scope === 'SearchSpotlightModal',
        )?.[1]
        const shortcutAction = bindings?.GO_ADVANCED_SEARCH.action

        expect(shortcutAction).toBeDefined()

        if (!shortcutAction) {
            throw new Error('Expected GO_ADVANCED_SEARCH shortcut to be bound')
        }

        act(() => {
            shortcutAction(new KeyboardEvent('keydown'))
        })

        expect(onClose).toHaveBeenCalledTimes(1)
        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/tickets/search',
            search: '',
        })
    })

    it('persists recents and closes on an unmodified result-link click', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()

        vi.spyOn(history, 'push').mockImplementation(vi.fn())
        vi.spyOn(window, 'open').mockImplementation(vi.fn())

        render(<SearchSpotlightRoot isOpen={true} onClose={onClose} />)

        await user.click(screen.getByText('Refund request').closest('a')!)

        expect(setRecentTicketItem).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 202,
            }),
        )
        expect(onClose).toHaveBeenCalled()
        expect(window.open).not.toHaveBeenCalled()
    })

    it('keeps spotlight open on modifier result-link clicks and does not use programmatic navigation', () => {
        const onClose = vi.fn()

        vi.spyOn(history, 'push').mockImplementation(vi.fn())
        vi.spyOn(window, 'open').mockImplementation(vi.fn())

        render(<SearchSpotlightRoot isOpen={true} onClose={onClose} />)

        fireEvent.click(screen.getByText('Refund request').closest('a')!, {
            ctrlKey: true,
        })

        expect(setRecentTicketItem).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 202,
            }),
        )
        expect(onClose).not.toHaveBeenCalled()
        expect(history.push).not.toHaveBeenCalled()
        expect(window.open).not.toHaveBeenCalled()
    })

    it('does not open a row on Enter before keyboard navigation starts', async () => {
        const user = userEvent.setup()

        vi.spyOn(history, 'push').mockImplementation(vi.fn())

        render(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        const input = screen.getByRole('searchbox', {
            name: /search for anything/i,
        })

        await user.click(input)
        await user.keyboard('{Enter}')

        expect(history.push).not.toHaveBeenCalled()
    })

    it('opens the first row after ArrowDown then Enter from the search field', async () => {
        const user = userEvent.setup()

        vi.spyOn(history, 'push').mockImplementation(vi.fn())

        render(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        const input = screen.getByRole('searchbox', {
            name: /search for anything/i,
        })

        await user.click(input)
        await user.keyboard('{ArrowDown}{Enter}')

        expect(history.push).toHaveBeenCalledWith('/app/customer/101')
    })

    it('scrolls the keyboard-selected row into view', async () => {
        const user = userEvent.setup()
        const originalScrollIntoView = Element.prototype.scrollIntoView
        const scrollIntoView = vi.fn()

        Object.defineProperty(Element.prototype, 'scrollIntoView', {
            configurable: true,
            value: scrollIntoView,
        })

        try {
            render(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

            const input = screen.getByRole('searchbox', {
                name: /search for anything/i,
            })

            await user.click(input)
            await user.keyboard('{ArrowDown}')

            expect(scrollIntoView).toHaveBeenCalledWith({
                block: 'nearest',
            })
        } finally {
            if (originalScrollIntoView) {
                Object.defineProperty(Element.prototype, 'scrollIntoView', {
                    configurable: true,
                    value: originalScrollIntoView,
                })
            } else {
                Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
            }
        }
    })

    it('opens the selected row in a new tab on modifier Enter', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()

        vi.spyOn(history, 'push').mockImplementation(vi.fn())
        vi.spyOn(window, 'open').mockImplementation(vi.fn())

        render(<SearchSpotlightRoot isOpen={true} onClose={onClose} />)

        const input = screen.getByRole('searchbox', {
            name: /search for anything/i,
        })

        await user.click(input)
        await user.keyboard('{ArrowDown}')

        await act(async () => {
            fireEvent.keyDown(input, {
                key: 'Enter',
                ctrlKey: true,
                metaKey: true,
            })
        })

        expect(setRecentCustomerItem).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 101,
            }),
        )
        expect(window.open).toHaveBeenCalledWith(
            '/app/customer/101',
            '_blank',
            'noopener',
        )
        expect(history.push).not.toHaveBeenCalled()
        expect(onClose).not.toHaveBeenCalled()
    })

    it('does not open selected rows that do not have a url', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()

        vi.spyOn(history, 'push').mockImplementation(vi.fn())
        vi.spyOn(window, 'open').mockImplementation(vi.fn())
        vi.mocked(useSearchSpotlightData).mockReturnValue({
            ...createSearchSpotlightDataMock(),
            isSearchMode: true,
            customers: [
                {
                    ...createCustomerSearchResult(101, 'Ada Lovelace'),
                    url: '',
                },
            ],
            totals: {
                customers: 1,
                tickets: 0,
                calls: 0,
            },
        })

        render(<SearchSpotlightRoot isOpen={true} onClose={onClose} />)

        const input = screen.getByRole('searchbox', {
            name: /search for anything/i,
        })

        await user.click(input)
        await user.keyboard('{ArrowDown}{Enter}')

        expect(setRecentCustomerItem).not.toHaveBeenCalled()
        expect(window.open).not.toHaveBeenCalled()
        expect(history.push).not.toHaveBeenCalled()
        expect(onClose).not.toHaveBeenCalled()
    })

    it('restores the last search query when the spotlight reopens', async () => {
        const user = userEvent.setup()
        const { rerender } = render(
            <SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />,
        )

        const input = screen.getByRole('searchbox', {
            name: /search for anything/i,
        })

        await user.clear(input)
        await user.type(input, 'refund')

        rerender(<SearchSpotlightRoot isOpen={false} onClose={vi.fn()} />)
        rerender(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        expect(
            screen.getByRole('searchbox', { name: /search for anything/i }),
        ).toHaveValue('refund')
    })

    it('clamps the selected row when visible results shrink', async () => {
        const user = userEvent.setup()

        vi.spyOn(history, 'push').mockImplementation(vi.fn())
        vi.mocked(useSearchSpotlightData).mockReturnValue({
            ...createSearchSpotlightDataMock(),
            isSearchMode: true,
            customers: [
                createCustomerSearchResult(101, 'Ada Lovelace'),
                createCustomerSearchResult(102, 'Grace Hopper'),
            ],
            totals: {
                customers: 2,
                tickets: 0,
                calls: 0,
            },
        })

        const { rerender } = render(
            <SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />,
        )

        const input = screen.getByRole('searchbox', {
            name: /search for anything/i,
        })

        await user.click(input)
        await user.keyboard('{ArrowDown}{ArrowDown}')

        vi.mocked(useSearchSpotlightData).mockReturnValue({
            ...createSearchSpotlightDataMock(),
            isSearchMode: true,
            customers: [createCustomerSearchResult(101, 'Ada Lovelace')],
            totals: {
                customers: 1,
                tickets: 0,
                calls: 0,
            },
        })

        rerender(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        await user.click(
            screen.getByRole('searchbox', { name: /search for anything/i }),
        )
        await user.keyboard('{Enter}')

        expect(history.push).toHaveBeenCalledWith('/app/customer/101')
    })

    it('clears the selection when visible results disappear', async () => {
        const user = userEvent.setup()

        vi.spyOn(history, 'push').mockImplementation(vi.fn())
        vi.mocked(useSearchSpotlightData).mockReturnValue({
            ...createSearchSpotlightDataMock(),
            isSearchMode: true,
            customers: [createCustomerSearchResult(101, 'Ada Lovelace')],
            totals: {
                customers: 1,
                tickets: 0,
                calls: 0,
            },
        })

        const { rerender } = render(
            <SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />,
        )

        const input = screen.getByRole('searchbox', {
            name: /search for anything/i,
        })

        await user.click(input)
        await user.keyboard('{ArrowDown}')

        vi.mocked(useSearchSpotlightData).mockReturnValue({
            ...createSearchSpotlightDataMock(),
            isSearchMode: true,
            customers: [],
            totals: {
                customers: 0,
                tickets: 0,
                calls: 0,
            },
        })

        rerender(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        await user.click(
            screen.getByRole('searchbox', { name: /search for anything/i }),
        )
        await user.keyboard('{Enter}')

        expect(history.push).not.toHaveBeenCalled()
    })

    it('fetches the next page when a single-section search view is scrolled to the end', async () => {
        const user = userEvent.setup()
        const fetchNextCustomerPage = vi.fn()

        vi.mocked(useSearchSpotlightData).mockReturnValue({
            ...createSearchSpotlightDataMock(),
            isSearchMode: true,
            customers: [],
            totals: {
                customers: 5000,
                tickets: 0,
                calls: 0,
            },
            pagination: {
                ...createPaginationState(),
                customers: {
                    hasNextPage: true,
                    isFetchingNextPage: false,
                    fetchNextPage: fetchNextCustomerPage,
                },
            },
        })

        render(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        await user.click(screen.getByRole('radio', { name: /^Customers/i }))

        const resultsRegion = screen.getByRole('region', {
            name: /search results/i,
        })

        Object.defineProperty(resultsRegion, 'scrollHeight', {
            configurable: true,
            value: 1000,
        })
        Object.defineProperty(resultsRegion, 'clientHeight', {
            configurable: true,
            value: 400,
        })
        Object.defineProperty(resultsRegion, 'scrollTop', {
            configurable: true,
            value: 520,
        })

        fireEvent.scroll(resultsRegion)

        expect(fetchNextCustomerPage).toHaveBeenCalledTimes(1)
    })

    it('does not fetch the next page while all sections are visible', () => {
        const fetchNextCustomerPage = vi.fn()

        vi.mocked(useSearchSpotlightData).mockReturnValue({
            ...createSearchSpotlightDataMock(),
            isSearchMode: true,
            customers: [createCustomerSearchResult(101, 'Ada Lovelace')],
            totals: {
                customers: 1,
                tickets: 0,
                calls: 0,
            },
            pagination: {
                ...createPaginationState(),
                customers: {
                    hasNextPage: true,
                    isFetchingNextPage: false,
                    fetchNextPage: fetchNextCustomerPage,
                },
            },
        })

        render(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        fireEvent.scroll(
            screen.getByRole('region', {
                name: /search results/i,
            }),
        )

        expect(fetchNextCustomerPage).not.toHaveBeenCalled()
    })

    it('keeps the current table visible while the next page is loading', () => {
        vi.mocked(useSearchSpotlightData).mockReturnValue({
            ...createSearchSpotlightDataMock(),
            isSearchMode: true,
            isLoading: true,
            customers: [
                {
                    kind: 'customer',
                    id: 101,
                    raw: {
                        id: 101,
                        name: 'Ada Lovelace',
                        email: 'ada@example.com',
                        phone: '+3311111111',
                    },
                    url: '/app/customer/101',
                    name: { text: 'Ada Lovelace' },
                    email: { text: 'ada@example.com' },
                    phone: { text: '+3311111111' },
                },
            ],
            totals: {
                customers: 5000,
                tickets: 0,
                calls: 0,
            },
            pagination: {
                ...createPaginationState(),
                customers: {
                    hasNextPage: true,
                    isFetchingNextPage: true,
                    fetchNextPage: vi.fn(),
                },
            },
        })

        render(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
        expect(screen.queryByText(/skeleton/i)).not.toBeInTheDocument()
    })

    it('hides calls when the package is rendered without voice support', () => {
        vi.mocked(useSearchSpotlightData).mockReturnValue({
            ...createSearchSpotlightDataMock(),
            isSearchMode: true,
            totals: {
                customers: 7,
                tickets: 11,
                calls: 13,
            },
        })

        render(
            <SearchSpotlightRoot
                isOpen={true}
                onClose={vi.fn()}
                showCalls={false}
            />,
        )

        expect(
            screen.queryByRole('radio', { name: /^Calls/i }),
        ).not.toBeInTheDocument()
        expect(screen.getByText('18')).toBeInTheDocument()
    })

    it('shows a skeleton while recent items are still loading', () => {
        vi.mocked(useRecentItems).mockImplementation(() => ({
            items: [],
            isGettingItems: true,
            setRecentItem: vi.fn(),
        }))

        render(<SearchSpotlightRoot isOpen={true} onClose={vi.fn()} />)

        expect(
            document.querySelector('[data-name="skeleton"]'),
        ).toBeInTheDocument()
    })

    it('does not navigate to advanced search from the calls tab', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()

        vi.spyOn(history, 'push').mockImplementation(vi.fn())
        vi.mocked(useSearchSpotlightData).mockReturnValue({
            ...createSearchSpotlightDataMock(),
            isSearchMode: true,
        })

        render(<SearchSpotlightRoot isOpen={true} onClose={onClose} />)

        await user.click(screen.getByRole('radio', { name: /^Calls/i }))
        await user.click(
            screen.getByRole('searchbox', {
                name: /search for anything/i,
            }),
        )
        await user.keyboard('{Shift>}{Enter}{/Shift}')

        expect(onClose).not.toHaveBeenCalled()
        expect(history.push).not.toHaveBeenCalled()
    })

    it('closes when the modal receives Escape', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()

        render(<SearchSpotlightRoot isOpen={true} onClose={onClose} />)

        await user.keyboard('{Escape}')

        expect(onClose).toHaveBeenCalled()
    })
})
