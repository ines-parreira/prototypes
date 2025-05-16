import React from 'react'

import { render } from '@testing-library/react'
import { StaticRouter } from 'react-router-dom'

import NavbarLink from '../NavbarLink'

describe('NavbarLink', () => {
    it('should render an inactive navbar link', () => {
        const { getByText } = render(
            <NavbarLink to="/app/tickets">Tickets</NavbarLink>,
            {
                wrapper: ({ children }: { children: React.ReactNode }) => (
                    <StaticRouter location="/app">{children}</StaticRouter>
                ),
            },
        )
        const el = getByText('Tickets')
        expect(el).toBeInTheDocument()
        expect(el).not.toHaveClass('current')
    })

    it('should render an active navbar link for a 1:1 match', () => {
        const { getByText } = render(
            <NavbarLink to="/app/tickets">Tickets</NavbarLink>,
            {
                wrapper: ({ children }: { children: React.ReactNode }) => (
                    <StaticRouter location="/app/tickets">
                        {children}
                    </StaticRouter>
                ),
            },
        )
        const el = getByText('Tickets')
        expect(el).toBeInTheDocument()
        expect(el).toHaveClass('current')
    })

    it('should render an active navbar link for a partial match', () => {
        const { getByText } = render(
            <NavbarLink to="/app/tickets">Tickets</NavbarLink>,
            {
                wrapper: ({ children }: { children: React.ReactNode }) => (
                    <StaticRouter location="/app/tickets/1234">
                        {children}
                    </StaticRouter>
                ),
            },
        )
        const el = getByText('Tickets')
        expect(el).toBeInTheDocument()
        expect(el).toHaveClass('current')
    })

    it('should render an active navbar link for a plural match', () => {
        const { getByText } = render(
            <NavbarLink to="/app/ticket">Tickets</NavbarLink>,
            {
                wrapper: ({ children }: { children: React.ReactNode }) => (
                    <StaticRouter location="/app/tickets">
                        {children}
                    </StaticRouter>
                ),
            },
        )
        const el = getByText('Tickets')
        expect(el).toBeInTheDocument()
        expect(el).toHaveClass('current')
    })
})
