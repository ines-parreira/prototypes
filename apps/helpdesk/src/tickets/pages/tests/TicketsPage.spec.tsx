import { render, screen } from '@testing-library/react'
import { Route, StaticRouter } from 'react-router-dom'

import { Panels } from 'core/layout/panels'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { assumeMock } from 'utils/testing'

import { TicketsPage } from '../TicketsPage'

jest.mock('split-ticket-view-toggle', () => ({ useSplitTicketView: jest.fn() }))
const useSplitTicketViewMock = assumeMock(useSplitTicketView)

jest.mock('tickets/navigation', () => ({
    TicketsNavbarPanel: () => <div>TicketsNavbarPanel</div>,
}))
jest.mock('tickets/ticket-detail', () => ({
    TicketDetailPanel: () => <div>TicketDetailPanel</div>,
}))
jest.mock('tickets/ticket-empty', () => ({
    TicketEmptyPanel: () => <div>TicketEmptyPanel</div>,
}))
jest.mock('tickets/ticket-infobar', () => ({
    TicketInfobarPanel: () => <div>TicketInfobarPanel</div>,
}))
jest.mock('tickets/tickets-list', () => ({
    TicketsListPanel: () => <div>TicketsListPanel</div>,
}))
jest.mock('tickets/view', () => ({
    ViewPanel: () => <div>ViewPanel</div>,
}))

type STVValue = ReturnType<typeof useSplitTicketView>

describe('TicketsPage', () => {
    beforeEach(() => {
        useSplitTicketViewMock.mockReturnValue({ isEnabled: false } as STVValue)
    })

    it('should render the corrent components for /app/tickets with DTP disabled', () => {
        render(
            <StaticRouter location="/app/tickets">
                <Route path="/app/tickets">
                    <Panels size={1000}>
                        <TicketsPage />
                    </Panels>
                </Route>
            </StaticRouter>,
        )

        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the corrent components for /app/tickets with DTP enabled', () => {
        useSplitTicketViewMock.mockReturnValue({ isEnabled: true } as STVValue)
        render(
            <StaticRouter location="/app/tickets">
                <Route path="/app/tickets">
                    <Panels size={1000}>
                        <TicketsPage />
                    </Panels>
                </Route>
            </StaticRouter>,
        )

        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketsListPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketEmptyPanel')).toBeInTheDocument()
    })

    it('should render the corrent components for /app/tickets/:viewId with DTP disabled', () => {
        render(
            <StaticRouter location="/app/tickets/123">
                <Route path="/app/tickets">
                    <Panels size={1000}>
                        <TicketsPage />
                    </Panels>
                </Route>
            </StaticRouter>,
        )

        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the corrent components for /app/tickets/:viewId with DTP enabled', () => {
        useSplitTicketViewMock.mockReturnValue({ isEnabled: true } as STVValue)
        render(
            <StaticRouter location="/app/tickets/123">
                <Route path="/app/tickets">
                    <Panels size={1000}>
                        <TicketsPage />
                    </Panels>
                </Route>
            </StaticRouter>,
        )

        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketsListPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketEmptyPanel')).toBeInTheDocument()
    })

    it('should render the corrent components for /app/tickets/:viewId/:ticketId with DTP disabled', () => {
        render(
            <StaticRouter location="/app/tickets/123/456">
                <Route path="/app/tickets">
                    <Panels size={1000}>
                        <TicketsPage />
                    </Panels>
                </Route>
            </StaticRouter>,
        )

        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketDetailPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketInfobarPanel')).toBeInTheDocument()
    })

    it('should render the corrent components for /app/tickets/:viewId/:ticketId with DTP enabled', () => {
        useSplitTicketViewMock.mockReturnValue({ isEnabled: true } as STVValue)
        render(
            <StaticRouter location="/app/tickets/123/456">
                <Route path="/app/tickets">
                    <Panels size={1000}>
                        <TicketsPage />
                    </Panels>
                </Route>
            </StaticRouter>,
        )

        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketsListPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketDetailPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketInfobarPanel')).toBeInTheDocument()
    })
})
