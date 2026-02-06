import { act, screen } from '@testing-library/react'
import { useLocation } from 'react-router'

import { render } from '../../tests/render.utils'
import type { LegacyBridgeContextType } from '../../utils/LegacyBridge/context'
import { TicketViewNavigator } from './TicketViewNavigator'

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

describe('TicketViewNavigator', () => {
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
