import React from 'react'

import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {CustomReport} from 'pages/stats/custom-reports/CustomReport'
import {CustomReportChart} from 'pages/stats/custom-reports/CustomReportChart'
import {CustomReportSection} from 'pages/stats/custom-reports/CustomReportSection'
import {
    CustomReportChartSchema,
    CustomReportChildType,
    CustomReportRowSchema,
    CustomReportSchema,
    CustomReportSectionSchema,
} from 'pages/stats/custom-reports/types'
import {useFiltersFromDashboard} from 'pages/stats/custom-reports/useFiltersFromDashboard'
import {DrillDownModal} from 'pages/stats/DrillDownModal'
import {OverviewMetric} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper')
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)
jest.mock('pages/stats/custom-reports/CustomReportChart')
const CustomReportChartMock = assumeMock(CustomReportChart)
jest.mock('pages/stats/custom-reports/CustomReportSection')
const CustomReportSectionMock = assumeMock(CustomReportSection)
jest.mock('pages/stats/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)
jest.mock('pages/stats/custom-reports/useFiltersFromDashboard')
const useFiltersFromDashboardMock = assumeMock(useFiltersFromDashboard)

describe('CustomReport', () => {
    const section: CustomReportSectionSchema = {
        children: [],
        type: CustomReportChildType.Section,
    }
    const chart: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: OverviewMetric.TicketsCreated,
    }

    const row: CustomReportRowSchema = {
        type: CustomReportChildType.Row,
        children: [chart],
    }
    const customReport: CustomReportSchema = {
        id: 2,
        analytics_filter_id: 1,
        name: 'some report',
        emoji: null,
        children: [row, section],
    }

    beforeEach(() => {
        FiltersPanelWrapperMock.mockReturnValue(<div />)
        CustomReportSectionMock.mockReturnValue(<div />)
        CustomReportChartMock.mockReturnValue(<div />)
        DrillDownModalMock.mockReturnValue(<div />)

        useFiltersFromDashboardMock.mockReturnValue({
            persistentFilters: [],
            optionalFilters: [],
        })
    })

    it('renders correctly', () => {
        renderWithStore(<CustomReport customReport={customReport} />, {})

        expect(CustomReportChartMock).toHaveBeenCalled()

        expect(useFiltersFromDashboardMock).toHaveBeenCalledWith(customReport)
    })
})
