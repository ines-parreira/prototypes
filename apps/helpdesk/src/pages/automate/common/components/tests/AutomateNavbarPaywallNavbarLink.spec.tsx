import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'

import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'

import AutomateNavbarPaywallNavbarLink from '../AutomateNavbarPaywallNavbarLink'

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
    () => ({
        useReportChartRestrictions: jest.fn(),
    }),
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('AutomateNavbarPaywallNavbarLink', () => {
    beforeEach(() => {
        useReportChartRestrictionsMock.mockReturnValue({
            isRouteRestrictedToCurrentUser: () => false,
        } as any)
    })

    it('renders children correctly', () => {
        render(
            <Router>
                <AutomateNavbarPaywallNavbarLink to="/test">
                    Test Link
                </AutomateNavbarPaywallNavbarLink>
            </Router>,
        )
        expect(screen.getByText('Test Link')).toBeInTheDocument()
    })

    it('applies nested class when isNested is true', () => {
        render(
            <Router>
                <AutomateNavbarPaywallNavbarLink to="/test" isNested>
                    Test Link
                </AutomateNavbarPaywallNavbarLink>
            </Router>,
        )

        expect(screen.getByRole('link').closest('div')).toHaveClass('isNested')
    })
})
