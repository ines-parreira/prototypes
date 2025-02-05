import {useGetAnalyticsCustomReport} from '@gorgias/api-queries'
import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {
    CustomReport,
    findChartIndex,
} from 'pages/stats/custom-reports/CustomReport'
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
import {RootState} from 'state/types'
import {initialState} from 'state/ui/stats/filtersSlice'
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

    const state = {
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            },
        },
        ui: {
            stats: {
                filters: initialState,
            },
        },
    } as RootState

    const renderComponent = (ui: React.ReactElement) => {
        return renderWithStore(
            <DndProvider backend={HTML5Backend}>{ui}</DndProvider>,
            state
        )
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
        renderComponent(
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

        renderComponent(
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

        renderComponent(
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

    it('_findChartIndex correctly delegates to findChartIndex', () => {
        renderComponent(
            <CustomReport
                onChartMove={jest.fn()}
                onChartMoveEnd={jest.fn()}
                customReport={customReport}
            />
        )

        const chartProps = CustomReportChartMock.mock.calls[0][0]
        const result = chartProps.findChartIndex('some-chart-id')

        expect(result).toBe(findChartIndex(customReport, 'some-chart-id'))
    })
})

describe('findChartIndex', () => {
    const chart1: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: 'chart1',
    }
    const chart2: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: 'chart2',
    }
    const chart3: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: 'chart3',
    }

    it('finds chart in root level', () => {
        const dashboard: CustomReportSchema = {
            id: 1,
            analytics_filter_id: 1,
            name: 'test',
            emoji: null,
            children: [chart1, chart2],
        }

        expect(findChartIndex(dashboard, 'chart2')).toBe(1)
    })

    it('finds chart in nested row', () => {
        const dashboard: CustomReportSchema = {
            id: 1,
            analytics_filter_id: 1,
            name: 'test',
            emoji: null,
            children: [
                {
                    type: CustomReportChildType.Row,
                    children: [chart1, chart2],
                },
            ],
        }

        expect(findChartIndex(dashboard, 'chart2')).toBe(1)
    })

    it('finds chart in nested section', () => {
        const dashboard: CustomReportSchema = {
            id: 1,
            analytics_filter_id: 1,
            name: 'test',
            emoji: null,
            children: [
                {
                    type: CustomReportChildType.Section,
                    children: [chart1, chart2, chart3],
                },
            ],
        }

        expect(findChartIndex(dashboard, 'chart3')).toBe(2)
    })

    it('returns -1 when chart is not found', () => {
        const dashboard: CustomReportSchema = {
            id: 1,
            analytics_filter_id: 1,
            name: 'test',
            emoji: null,
            children: [chart1, chart2],
        }

        expect(findChartIndex(dashboard, 'non-existent')).toBe(-1)
    })

    it('finds chart in deeply nested structure', () => {
        const dashboard: CustomReportSchema = {
            id: 1,
            analytics_filter_id: 1,
            name: 'test',
            emoji: null,
            children: [
                {
                    type: CustomReportChildType.Section,
                    children: [
                        {
                            type: CustomReportChildType.Row,
                            children: [chart1, chart2],
                        },
                        {
                            type: CustomReportChildType.Row,
                            children: [chart3],
                        },
                    ],
                },
            ],
        }

        expect(findChartIndex(dashboard, 'chart3')).toBe(0)
    })
})
