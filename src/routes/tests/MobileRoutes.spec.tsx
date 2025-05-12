import React from 'react'

import { render, screen } from '@testing-library/react'
import { StaticRouter } from 'react-router-dom'

import App from 'pages/App'
import TicketDetailContainer from 'pages/tickets/detail/TicketDetailContainer'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import TicketList from 'pages/tickets/list/TicketList'
import { TicketNavBarRevampWrapper } from 'pages/tickets/navbar/v2/TicketNavBarRevampWrapper'

import { MobileRoutes } from '../MobileRoutes'

jest.mock('pages/App', () => jest.fn(() => <div>App</div>))

describe('MobileRoutes', () => {
    it.each([
        [
            '/app',
            '/app',
            { content: TicketList, navbar: TicketNavBarRevampWrapper },
        ],
        [
            '/app/tickets',
            '/app/tickets',
            { content: TicketList, navbar: TicketNavBarRevampWrapper },
        ],
        [
            '/app/tickets/new/:visibility?',
            '/app/tickets/new',
            { content: TicketList, navbar: TicketNavBarRevampWrapper },
        ],
        [
            '/app/tickets/search',
            '/app/tickets/search',
            { content: TicketList, navbar: TicketNavBarRevampWrapper },
        ],
        [
            '/app/tickets/:viewId/:viewSlug?',
            '/app/tickets/123456',
            { content: TicketList, navbar: TicketNavBarRevampWrapper },
        ],

        [
            '/app/ticket/:ticketId',
            '/app/ticket/123456',
            {
                content: TicketDetailContainer,
                navbar: TicketNavBarRevampWrapper,
                infobar: TicketInfobarContainer,
                infobarOnMobile: true,
            },
        ],
        [
            '/app/views/:viewId?',
            '/app/views',
            { content: TicketList, navbar: TicketNavBarRevampWrapper },
        ],
        [
            '/app/views/:viewId/:ticketId',
            '/app/views/123/456',
            {
                content: TicketDetailContainer,
                navbar: TicketNavBarRevampWrapper,
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
