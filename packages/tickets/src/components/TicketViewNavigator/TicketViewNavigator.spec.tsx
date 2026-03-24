import { logEvent, SegmentEvent } from '@repo/logging'
import { shortcutManager } from '@repo/utils'
import type { InfiniteData } from '@tanstack/react-query'
import { act, screen } from '@testing-library/react'
import { useLocation } from 'react-router'

import { mockTicketCompact } from '@gorgias/helpdesk-mocks'
import { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import { createTestQueryClient, render } from '../../tests/render.utils'
import { getNavigableTicketsListQueryKey } from '../../ticket-list/hooks/useTicketsList'
import type { LegacyBridgeContextType } from '../../utils/LegacyBridge/context'
import { TicketViewNavigator } from './TicketViewNavigator'

vi.mock('@repo/logging', () => ({
    logEvent: vi.fn(),
    SegmentEvent: {
        TicketKeyboardShortcutsPreviousNavigation:
            'TicketKeyboardShortcutsPreviousNavigation',
        TicketKeyboardShortcutsNextNavigation:
            'TicketKeyboardShortcutsNextNavigation',
    },
}))

const mockTicketViewNavigation: LegacyBridgeContextType['ticketViewNavigation'] =
    {
        shouldDisplay: true,
        shouldUseLegacyFunctions: false,
        previousTicketId: 100,
        nextTicketId: 102,
        legacyGoToPrevTicket: vi.fn(),
        isPreviousEnabled: true,
        legacyGoToNextTicket: vi.fn(),
        isNextEnabled: true,
    }

function LocationDisplay() {
    const location = useLocation()
    return <output aria-label="current location">{location.pathname}</output>
}

function makeInfiniteData(
    pages: TicketCompact[][],
): InfiniteData<{ data: TicketCompact[] }> {
    return {
        pages: pages.map((data) => ({ data })),
        pageParams: [],
    }
}

describe('TicketViewNavigator', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('when shouldDisplay is false', () => {
        it('should not render anything', () => {
            const { container } = render(<TicketViewNavigator />, {
                ticketViewNavigation: {
                    ...mockTicketViewNavigation,
                    shouldDisplay: false,
                },
            })

            expect(container.firstChild).toBeNull()
        })
    })

    describe('when shouldDisplay is true', () => {
        it('should render previous and next buttons', () => {
            render(<TicketViewNavigator />, {
                ticketViewNavigation: mockTicketViewNavigation,
                initialEntries: ['/app/views/1/101'],
                path: '/app/views/:viewId/:ticketId',
            })

            expect(
                screen.getByRole('button', { name: /arrow-chevron-left/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /arrow-chevron-right/i }),
            ).toBeInTheDocument()
        })

        it('should render buttons from active view cache even when legacy navigation is hidden', () => {
            const queryClient = createTestQueryClient()
            queryClient.setQueryData(
                getNavigableTicketsListQueryKey(
                    1,
                    ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
                ),
                makeInfiniteData([
                    [
                        mockTicketCompact({ id: 100 }),
                        mockTicketCompact({ id: 101 }),
                        mockTicketCompact({ id: 102 }),
                    ],
                ]),
            )

            render(<TicketViewNavigator />, {
                queryClient,
                ticketViewNavigation: {
                    ...mockTicketViewNavigation,
                    shouldDisplay: false,
                    shouldUseLegacyFunctions: true,
                    previousTicketId: undefined,
                    nextTicketId: undefined,
                    isPreviousEnabled: false,
                    isNextEnabled: false,
                },
                initialEntries: ['/app/views/1/101'],
                path: '/app/views/:viewId/:ticketId',
            })

            expect(
                screen.getByRole('button', { name: /arrow-chevron-left/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /arrow-chevron-right/i }),
            ).toBeInTheDocument()
        })
    })

    describe('navigation', () => {
        it('should navigate to previous ticket when previous button is clicked', async () => {
            const { user } = render(
                <>
                    <TicketViewNavigator />
                    <LocationDisplay />
                </>,
                {
                    ticketViewNavigation: mockTicketViewNavigation,
                    initialEntries: ['/app/views/1/101'],
                    path: '/app/views/:viewId/:ticketId',
                },
            )

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: /arrow-chevron-left/i }),
                ),
            )

            expect(
                screen.getByRole('status', { name: /current location/i }),
            ).toHaveTextContent('/app/views/1/100')
        })

        it('should navigate to next ticket when next button is clicked', async () => {
            const { user } = render(
                <>
                    <TicketViewNavigator />
                    <LocationDisplay />
                </>,
                {
                    ticketViewNavigation: mockTicketViewNavigation,
                    initialEntries: ['/app/views/1/101'],
                    path: '/app/views/:viewId/:ticketId',
                },
            )

            await act(() =>
                user.click(
                    screen.getByRole('button', {
                        name: /arrow-chevron-right/i,
                    }),
                ),
            )

            expect(
                screen.getByRole('status', { name: /current location/i }),
            ).toHaveTextContent('/app/views/1/102')
        })

        it('should not navigate when previous button is disabled', async () => {
            const { user } = render(
                <>
                    <TicketViewNavigator />
                    <LocationDisplay />
                </>,
                {
                    ticketViewNavigation: {
                        ...mockTicketViewNavigation,
                        isPreviousEnabled: false,
                    },
                    initialEntries: ['/app/views/1/101'],
                    path: '/app/views/:viewId/:ticketId',
                },
            )

            const prevButton = screen.getByRole('button', {
                name: /arrow-chevron-left/i,
            })
            expect(prevButton).toBeDisabled()

            await act(() => user.click(prevButton))
            expect(
                screen.getByRole('status', { name: /current location/i }),
            ).toHaveTextContent('/app/views/1/101')
        })

        it('should not navigate when next button is disabled', async () => {
            const { user } = render(
                <>
                    <TicketViewNavigator />
                    <LocationDisplay />
                </>,
                {
                    ticketViewNavigation: {
                        ...mockTicketViewNavigation,
                        isNextEnabled: false,
                    },
                    initialEntries: ['/app/views/1/101'],
                    path: '/app/views/:viewId/:ticketId',
                },
            )

            const nextButton = screen.getByRole('button', {
                name: /arrow-chevron-right/i,
            })
            expect(nextButton).toBeDisabled()

            await act(() => user.click(nextButton))
            expect(
                screen.getByRole('status', { name: /current location/i }),
            ).toHaveTextContent('/app/views/1/101')
        })

        it('should navigate to previous ticket from the keyboard and log the segment event', async () => {
            render(
                <>
                    <TicketViewNavigator />
                    <LocationDisplay />
                </>,
                {
                    ticketViewNavigation: mockTicketViewNavigation,
                    initialEntries: ['/app/views/1/101'],
                    path: '/app/views/:viewId/:ticketId',
                },
            )

            await act(() => {
                shortcutManager.triggerAction('TicketViewNavigator', 'GO_BACK')
            })

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.TicketKeyboardShortcutsPreviousNavigation,
            )
            expect(
                screen.getByRole('status', { name: /current location/i }),
            ).toHaveTextContent('/app/views/1/100')
        })

        it('should navigate to next ticket from the keyboard and log the segment event', async () => {
            render(
                <>
                    <TicketViewNavigator />
                    <LocationDisplay />
                </>,
                {
                    ticketViewNavigation: mockTicketViewNavigation,
                    initialEntries: ['/app/views/1/101'],
                    path: '/app/views/:viewId/:ticketId',
                },
            )

            await act(() => {
                shortcutManager.triggerAction(
                    'TicketViewNavigator',
                    'GO_FORWARD',
                )
            })

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.TicketKeyboardShortcutsNextNavigation,
            )
            expect(
                screen.getByRole('status', { name: /current location/i }),
            ).toHaveTextContent('/app/views/1/102')
        })

        it('should not navigate or log when previous keyboard navigation is disabled', async () => {
            render(
                <>
                    <TicketViewNavigator />
                    <LocationDisplay />
                </>,
                {
                    ticketViewNavigation: {
                        ...mockTicketViewNavigation,
                        isPreviousEnabled: false,
                    },
                    initialEntries: ['/app/views/1/101'],
                    path: '/app/views/:viewId/:ticketId',
                },
            )

            await act(() => {
                shortcutManager.triggerAction('TicketViewNavigator', 'GO_BACK')
            })

            expect(logEvent).not.toHaveBeenCalled()
            expect(
                screen.getByRole('status', { name: /current location/i }),
            ).toHaveTextContent('/app/views/1/101')
        })

        it('should not navigate or log when next keyboard navigation is disabled', async () => {
            render(
                <>
                    <TicketViewNavigator />
                    <LocationDisplay />
                </>,
                {
                    ticketViewNavigation: {
                        ...mockTicketViewNavigation,
                        isNextEnabled: false,
                    },
                    initialEntries: ['/app/views/1/101'],
                    path: '/app/views/:viewId/:ticketId',
                },
            )

            await act(() => {
                shortcutManager.triggerAction(
                    'TicketViewNavigator',
                    'GO_FORWARD',
                )
            })

            expect(logEvent).not.toHaveBeenCalled()
            expect(
                screen.getByRole('status', { name: /current location/i }),
            ).toHaveTextContent('/app/views/1/101')
        })
    })

    describe('legacy navigation', () => {
        it('should call legacyGoToPrevTicket when shouldUseLegacyFunctions is true and previous button is clicked', async () => {
            const legacyGoToPrevTicket = vi.fn().mockResolvedValue(undefined)
            const { user } = render(
                <>
                    <TicketViewNavigator />
                    <LocationDisplay />
                </>,
                {
                    ticketViewNavigation: {
                        ...mockTicketViewNavigation,
                        shouldUseLegacyFunctions: true,
                        legacyGoToPrevTicket,
                    },
                    initialEntries: ['/app/views/1/101'],
                    path: '/app/views/:viewId/:ticketId',
                },
            )

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: /arrow-chevron-left/i }),
                ),
            )

            expect(legacyGoToPrevTicket).toHaveBeenCalledTimes(1)
            expect(
                screen.getByRole('status', { name: /current location/i }),
            ).toHaveTextContent('/app/views/1/101')
        })

        it('should call legacyGoToNextTicket when shouldUseLegacyFunctions is true and next button is clicked', async () => {
            const legacyGoToNextTicket = vi.fn().mockResolvedValue(undefined)
            const { user } = render(
                <>
                    <TicketViewNavigator />
                    <LocationDisplay />
                </>,
                {
                    ticketViewNavigation: {
                        ...mockTicketViewNavigation,
                        shouldUseLegacyFunctions: true,
                        legacyGoToNextTicket,
                    },
                    initialEntries: ['/app/views/1/101'],
                    path: '/app/views/:viewId/:ticketId',
                },
            )

            await act(() =>
                user.click(
                    screen.getByRole('button', {
                        name: /arrow-chevron-right/i,
                    }),
                ),
            )

            expect(legacyGoToNextTicket).toHaveBeenCalledTimes(1)
            expect(
                screen.getByRole('status', { name: /current location/i }),
            ).toHaveTextContent('/app/views/1/101')
        })
    })

    describe('edge cases', () => {
        it('should not navigate when viewId is missing from URL', async () => {
            const { user } = render(
                <>
                    <TicketViewNavigator />
                    <LocationDisplay />
                </>,
                {
                    ticketViewNavigation: mockTicketViewNavigation,
                    initialEntries: ['/app/tickets/101'],
                    path: '/app/tickets/:ticketId',
                },
            )

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: /arrow-chevron-left/i }),
                ),
            )

            expect(
                screen.getByRole('status', { name: /current location/i }),
            ).toHaveTextContent('/app/tickets/101')
        })
    })
})
