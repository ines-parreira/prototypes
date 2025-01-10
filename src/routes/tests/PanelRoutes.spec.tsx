import {render, screen} from '@testing-library/react'
import React from 'react'
import {StaticRouter} from 'react-router-dom'

import PanelRoutes from '../PanelRoutes'

jest.mock('pages/PanelLayout', () => ({kind}: {kind: string}) => (
    <div>PanelLayout {kind}</div>
))
jest.mock('tickets/pages/SplitTicketPage', () => ({
    useSplitTicketPage: () => ({kind: 'split-ticket-page'}),
}))
jest.mock('tickets/pages/SplitViewPage', () => ({
    useSplitViewPage: () => ({kind: 'split-view-page'}),
}))
jest.mock('tickets/pages/TicketPage', () => ({
    useTicketPage: () => ({kind: 'ticket-page'}),
}))
jest.mock('tickets/pages/ViewPage', () => ({
    useViewPage: () => ({kind: 'view-page'}),
}))

describe('PanelRoutes', () => {
    beforeEach(() => {})

    it('should render the full width view for /app', () => {
        render(
            <StaticRouter location="/app">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('PanelLayout view-page')).toBeInTheDocument()
    })

    it('should render the full width view for /app/tickets', () => {
        render(
            <StaticRouter location="/app/tickets">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('PanelLayout view-page')).toBeInTheDocument()
    })

    it('should render the full width view for /app/tickets/new', () => {
        render(
            <StaticRouter location="/app/tickets/new">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('PanelLayout view-page')).toBeInTheDocument()
    })

    it('should render the full width view for /app/tickets/search', () => {
        render(
            <StaticRouter location="/app/tickets/search">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('PanelLayout view-page')).toBeInTheDocument()
    })

    it('should render the full width view for /app/tickets/:viewId/:viewSlug?', () => {
        render(
            <StaticRouter location="/app/tickets/123456">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('PanelLayout view-page')).toBeInTheDocument()
    })

    it('should render the full width view for /app/ticket/:ticketId', () => {
        render(
            <StaticRouter location="/app/ticket/123456">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(screen.getByText('PanelLayout ticket-page')).toBeInTheDocument()
    })

    it('should render the full width view for /app/views/:viewId', () => {
        render(
            <StaticRouter location="/app/views/123456">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(
            screen.getByText('PanelLayout split-view-page')
        ).toBeInTheDocument()
    })

    it('should render the full width view for /app/views/:viewId/:ticketId', () => {
        render(
            <StaticRouter location="/app/views/123456/789987">
                <PanelRoutes />
            </StaticRouter>
        )
        expect(
            screen.getByText('PanelLayout split-ticket-page')
        ).toBeInTheDocument()
    })
})
