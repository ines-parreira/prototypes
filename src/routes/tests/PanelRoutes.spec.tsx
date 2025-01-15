import {render, screen} from '@testing-library/react'
import React from 'react'
import {StaticRouter} from 'react-router-dom'

import useWindowSize from 'hooks/useWindowSize'
import {assumeMock} from 'utils/testing'

import PanelRoutes from '../PanelRoutes'

jest.mock('core/navigation', () => ({
    GlobalNavigationPanel: () => <div>GlobalNavigationPanel</div>,
}))
jest.mock('hooks/useWindowSize', () => jest.fn())
const useWindowSizeMock = assumeMock(useWindowSize)
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

describe('PanelRoutes', () => {
    beforeEach(() => {
        useWindowSizeMock.mockReturnValue({width: 1000, height: 1000})
    })

    it('should render the global navigation', () => {
        render(
            <StaticRouter location="/app">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('GlobalNavigationPanel')).toBeInTheDocument()
    })

    it('should render the tickets navbar', () => {
        render(
            <StaticRouter location="/app">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app', () => {
        render(
            <StaticRouter location="/app">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/tickets', () => {
        render(
            <StaticRouter location="/app/tickets">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/tickets/new/:visibility?', () => {
        render(
            <StaticRouter location="/app/tickets/new/private">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/tickets/search', () => {
        render(
            <StaticRouter location="/app/tickets/search">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/tickets/:viewId/:viewSlug?', () => {
        render(
            <StaticRouter location="/app/tickets/123456/boop">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/ticket/:ticketId', () => {
        render(
            <StaticRouter location="/app/ticket/123456">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('TicketDetailPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketInfobarPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/views/:viewId?', () => {
        render(
            <StaticRouter location="/app/views/123456">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('TicketsListPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketEmptyPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/views/:viewId/:ticketId', () => {
        render(
            <StaticRouter location="/app/views/123456/789987">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('TicketsListPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketDetailPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketInfobarPanel')).toBeInTheDocument()
    })
})
