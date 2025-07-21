import React from 'react'

import { render, screen } from '@testing-library/react'

import { ProtectedRoute } from 'domains/reporting/pages/report-chart-restrictions/ProtectedRoute'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { assumeMock } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
    () => ({
        useReportChartRestrictions: jest.fn(),
    }),
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('ProtectedRoute', () => {
    it('should not render the children when the path is not restricted', () => {
        useReportChartRestrictionsMock.mockReturnValue({
            isRouteRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        } as any)

        render(
            <ProtectedRoute path="/any/path">
                <div>children</div>
            </ProtectedRoute>,
        )

        expect(screen.getByText('children')).toBeInTheDocument()
    })

    it('should render the children when the path is restricted', () => {
        useReportChartRestrictionsMock.mockReturnValue({
            isRouteRestrictedToCurrentUser: () => true,
            isModuleRestrictedToCurrentUser: () => false,
        } as any)

        render(
            <ProtectedRoute path="/any/path">
                <div>children</div>
            </ProtectedRoute>,
        )

        expect(screen.queryByText('children')).not.toBeInTheDocument()
    })

    it('should render the children when the module navigation route is restricted', () => {
        useReportChartRestrictionsMock.mockReturnValue({
            isRouteRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => true,
        } as any)

        render(
            <ProtectedRoute path="/any/path">
                <div>children</div>
            </ProtectedRoute>,
        )

        expect(screen.queryByText('children')).not.toBeInTheDocument()
    })
})
