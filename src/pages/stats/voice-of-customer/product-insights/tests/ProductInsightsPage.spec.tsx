import React from 'react'

import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { ReportingGranularity } from 'models/reporting/types'
import { DrillDownModal } from 'pages/stats/common/drill-down/DrillDownModal'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { ProductInsightsEditColumns } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsEditColumns'
import {
    PRODUCT_INSIGHTS_PAGE_TITLE,
    ProductInsightsPage,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsPage'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('hooks/reporting/useCleanStatsFilters')
jest.mock('pages/stats/common/drill-down/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)
jest.mock('pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper')
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)
jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)
jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock(
    'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsEditColumns',
)
const ProductInsightsEditColumnsMock = assumeMock(ProductInsightsEditColumns)

describe('ProductInsightsPage', () => {
    const statsFilters = {
        period: {
            start_datetime: '2024-09-14T00:00:00+00:00',
            end_datetime: '2024-09-20T23:59:59+00:00',
        },
    }
    const state = {
        currentUser: fromJS({ role: { name: UserRole.Admin } }),
    }

    beforeEach(() => {
        ProductInsightsEditColumnsMock.mockImplementation(() => <div />)
        DrillDownModalMock.mockImplementation(() => <div />)
        FiltersPanelWrapperMock.mockImplementation(() => <div />)
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        useReportChartRestrictionsMock.mockImplementation(() => ({
            isRouteRestrictedToCurrentUser: () => false,
            isChartRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        }))
    })

    it('should render with a title', () => {
        renderWithStore(<ProductInsightsPage />, state)

        expect(
            screen.queryByText(PRODUCT_INSIGHTS_PAGE_TITLE, { exact: false }),
        ).toBeTruthy()
    })
})
