import {render, screen} from '@testing-library/react'
import React from 'react'
import {useRouteMatch} from 'react-router-dom'

import useScrollActiveItemIntoView from 'hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import {useReportChartRestrictions} from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import {STATS_ROUTES} from 'routes/constants'
import {assumeMock} from 'utils/testing'

const NavLinkMock = ({children, ...props}: {children: React.ReactNode}) => (
    <div {...props}>{children}</div>
)

jest.mock('react-router-dom', () => ({
    NavLink: NavLinkMock,
    useRouteMatch: jest.fn(),
    match: {isExact: true},
}))
const useRouteMatchMock = assumeMock(useRouteMatch)

jest.mock('hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView')
const useScrollActiveItemIntoViewMock = assumeMock(useScrollActiveItemIntoView)

jest.mock(
    'pages/stats/report-chart-restrictions/useReportChartRestrictions',
    () => ({
        useReportChartRestrictions: jest.fn(),
    })
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

const path = STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS

describe('NavbarLink', () => {
    beforeEach(() => {
        useRouteMatchMock.mockReturnValue({
            isExact: true,
        } as any)

        useReportChartRestrictionsMock.mockReturnValue({
            isRouteRestrictedToCurrentUser: () => false,
        } as any)

        render(
            <NavbarLink to={path} className="className" exact>
                NavLink
            </NavbarLink>
        )
    })

    it('should render the link correctly', () => {
        expect(screen.getByText('NavLink')).toBeInTheDocument()
    })

    it('should apply link class when the route matches', () => {
        expect(screen.getByText('NavLink')).toHaveClass('link')
        expect(screen.getByText('NavLink')).toHaveClass('className')
    })

    it('should call useScrollActiveItemIntoView with isActive true', () => {
        expect(useScrollActiveItemIntoViewMock).toHaveBeenCalledWith(
            {current: null},
            true,
            true
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
            </NavbarLink>
        )
    })

    it('should call useScrollActiveItemIntoView with isActive false', () => {
        expect(useScrollActiveItemIntoViewMock).toHaveBeenCalledWith(
            {current: null},
            false,
            true
        )
    })
})

describe('NavbarLink with useReportChartRestrictions set to false', () => {
    useRouteMatchMock.mockReturnValue({
        isExact: true,
    } as any)

    useReportChartRestrictionsMock.mockReturnValue({
        isRouteRestrictedToCurrentUser: () => true,
    } as any)

    render(
        <NavbarLink to={path} className="className" exact>
            NavLink
        </NavbarLink>
    )

    it('should render the link correctly', () => {
        expect(screen.queryByText('NavLink')).not.toBeInTheDocument()
    })
})
