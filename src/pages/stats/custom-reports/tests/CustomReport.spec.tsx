import {useGetAnalyticsCustomReport} from '@gorgias/api-queries'
import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

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
import {updateChartPosition} from 'pages/stats/custom-reports/utils'
import {OverviewMetric} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('@gorgias/api-queries')
const useGetAnalyticsCustomReportMock = assumeMock(useGetAnalyticsCustomReport)

jest.mock('pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper')
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)
jest.mock('pages/stats/custom-reports/CustomReportChart')
const CustomReportChartMock = assumeMock(CustomReportChart)
jest.mock('pages/stats/custom-reports/CustomReportSection')
const CustomReportSectionMock = assumeMock(CustomReportSection)
jest.mock('pages/stats/custom-reports/useFiltersFromDashboard')
const useFiltersFromDashboardMock = assumeMock(useFiltersFromDashboard)

const render = (ui: React.ReactElement) => {
    return renderWithStore(
        <DndProvider backend={HTML5Backend}>{ui}</DndProvider>,
        {}
    )
}

describe('CustomReport', () => {
    const section: CustomReportSectionSchema = {
        children: [],
        type: CustomReportChildType.Section,
    }
    const chart1: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: OverviewMetric.TicketsCreated,
    }
    const chart2: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: OverviewMetric.TicketsClosed,
    }

    const row: CustomReportRowSchema = {
        type: CustomReportChildType.Row,
        children: [chart1, chart2],
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
    })

    beforeEach(() => {
        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: undefined,
        } as any)

        useFiltersFromDashboardMock.mockReturnValue({
            persistentFilters: [],
            optionalFilters: [],
        })
    })

    it('renders correctly', () => {
        render(
            <CustomReport
                onChartMove={jest.fn()}
                onChartMoveEnd={jest.fn()}
                customReport={customReport}
            />
        )

        expect(CustomReportChartMock).toHaveBeenCalled()

        expect(useFiltersFromDashboardMock).toHaveBeenCalledWith(customReport)
    })

    it('calls onChartMove with correct parameters when moving chart', () => {
        const onChartMove = jest.fn()

        render(
            <CustomReport
                onChartMove={onChartMove}
                onChartMoveEnd={jest.fn()}
                customReport={customReport}
            />
        )

        const chartProps = CustomReportChartMock.mock.calls[0][0]

        const srcId = chart1.config_id
        const targetId = chart2.config_id

        ;(
            chartProps.onMove as (
                srcId: string,
                targetId: string,
                position: 'after' | 'before'
            ) => void
        )(srcId, targetId, 'after')

        expect(onChartMove).toHaveBeenCalledWith(
            updateChartPosition(customReport, srcId, targetId, 'after')
        )
    })

    it('calls onChartMoveEnd when chart is dropped', () => {
        const onChartMoveEnd = jest.fn()

        render(
            <CustomReport
                onChartMove={jest.fn()}
                onChartMoveEnd={onChartMoveEnd}
                customReport={customReport}
            />
        )

        const chartProps = CustomReportChartMock.mock.calls[0][0]

        ;(chartProps.onDrop as () => void)()

        expect(onChartMoveEnd).toHaveBeenCalled()
    })
})
