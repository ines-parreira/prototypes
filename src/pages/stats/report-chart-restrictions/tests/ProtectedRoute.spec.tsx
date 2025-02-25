import React from 'react'

import { render, screen } from '@testing-library/react'

import { ProtectedRoute } from 'pages/stats/report-chart-restrictions/ProtectedRoute'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { assumeMock } from 'utils/testing'

jest.mock(
    'pages/stats/report-chart-restrictions/useReportChartRestrictions',
    () => ({
        useReportChartRestrictions: jest.fn(),
    }),
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('ProtectedRoute', () => {
    it('should not render the children when the path is restricted', () => {
        useReportChartRestrictionsMock.mockReturnValue({
            isRouteRestrictedToCurrentUser: () => false,
        } as any)

        render(
            <ProtectedRoute path="/any/path">
                <div>children</div>
            </ProtectedRoute>,
        )

        expect(screen.getByText('children')).toBeInTheDocument()
    })

    it('should render the children when the path is not restricted', () => {
        useReportChartRestrictionsMock.mockReturnValue({
            isRouteRestrictedToCurrentUser: () => true,
        } as any)

        render(
            <ProtectedRoute path="/any/path">
                <div>children</div>
            </ProtectedRoute>,
        )

        expect(screen.queryByText('children')).not.toBeInTheDocument()
    })
})
