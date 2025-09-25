import React from 'react'

import { render, screen } from '@testing-library/react'
import { StaticRouter } from 'react-router-dom'

import App from 'pages/App'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import TicketList from 'pages/tickets/list/TicketList'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import TicketWrapper from 'split-ticket-view/components/TicketWrapper'

import { MobileRoutes } from '../MobileRoutes'

jest.mock('pages/App', () => jest.fn(() => <div>App</div>))

describe('MobileRoutes', () => {
    it.each([
        ['/app', '/app', { content: TicketList, navbar: TicketNavbar }],
        [
            '/app/tickets',
            '/app/tickets',
            { content: TicketList, navbar: TicketNavbar },
        ],
        [
            '/app/tickets/new/:visibility?',
            '/app/tickets/new',
            { content: TicketList, navbar: TicketNavbar },
        ],
        [
            '/app/tickets/search',
            '/app/tickets/search',
            { content: TicketList, navbar: TicketNavbar },
        ],
        [
            '/app/tickets/:viewId/:viewSlug?',
            '/app/tickets/123456',
            { content: TicketList, navbar: TicketNavbar },
        ],

        [
            '/app/ticket/:ticketId',
            '/app/ticket/123456',
            {
                content: TicketWrapper,
                navbar: TicketNavbar,
                infobar: TicketInfobarContainer,
                infobarOnMobile: true,
            },
        ],
        [
            '/app/views/:viewId?',
            '/app/views',
            { content: TicketList, navbar: TicketNavbar },
        ],
        [
            '/app/views/:viewId/:ticketId',
            '/app/views/123/456',
            {
                content: TicketWrapper,
                navbar: TicketNavbar,
                infobar: TicketInfobarContainer,
                infobarOnMobile: true,
            },
        ],
    ])(
        'should render the correct components for %s',
        (_path, location, props) => {
            render(
                <StaticRouter location={location}>
                    <MobileRoutes />
                </StaticRouter>,
            )

            expect(screen.getByText('App')).toBeInTheDocument()
            expect(App).toHaveBeenCalledWith(props, {})
        },
    )
})
