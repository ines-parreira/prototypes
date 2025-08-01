import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { useRouteMatch } from 'react-router-dom'

import useScrollActiveItemIntoView from 'hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import { STATS_ROUTES } from 'routes/constants'

jest.mock('react-router-dom', () => ({
    NavLink: ({ children, ...props }: { children: React.ReactNode }) => (
        <div {...props}>{children}</div>
    ),
    useRouteMatch: jest.fn(),
    match: { isExact: true },
}))
const useRouteMatchMock = assumeMock(useRouteMatch)

jest.mock('hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView')
const useScrollActiveItemIntoViewMock = assumeMock(useScrollActiveItemIntoView)

const path = STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS

describe('NavbarLink', () => {
    beforeEach(() => {
        useRouteMatchMock.mockReturnValue({
            isExact: true,
        } as any)
    })

    it('should render the link correctly', () => {
        render(
            <NavbarLink to={path} className="className" exact>
                NavLink
            </NavbarLink>,
        )

        expect(screen.getByText('NavLink')).toBeInTheDocument()
    })

    it('should apply link class when the route matches', () => {
        render(
            <NavbarLink to={path} className="className" exact>
                NavLink
            </NavbarLink>,
        )

        expect(screen.getByText('NavLink')).toHaveClass('link')
        expect(screen.getByText('NavLink')).toHaveClass('className')
    })

    it('should call useScrollActiveItemIntoView with isActive true', () => {
        render(
            <NavbarLink to={path} className="className" exact>
                NavLink
            </NavbarLink>,
        )

        expect(useScrollActiveItemIntoViewMock).toHaveBeenCalledWith(
            { current: null },
            true,
            true,
        )
    })
})

describe('NavbarLink with isExact false', () => {
    beforeEach(() => {
        useRouteMatchMock.mockReturnValue({
            isExact: false,
        } as any)

        render(
            <NavbarLink to={path} className="className" exact>
                NavLink
            </NavbarLink>,
        )
    })

    it('should call useScrollActiveItemIntoView with isActive false', () => {
        expect(useScrollActiveItemIntoViewMock).toHaveBeenCalledWith(
            { current: null },
            false,
            true,
        )
    })
})
