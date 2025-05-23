import React from 'react'

import { HTML5Backend } from 'react-dnd-html5-backend'

import { useGetAnalyticsCustomReport } from '@gorgias/helpdesk-queries'

import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import { Dashboard, findChartIndex } from 'pages/stats/dashboards/Dashboard'
import { DashboardChart } from 'pages/stats/dashboards/DashboardChart'
import { DashboardsSection } from 'pages/stats/dashboards/DashboardsSection'
import {
    DashboardChartSchema,
    DashboardChildType,
    DashboardRowSchema,
    DashboardSchema,
    DashboardSectionSchema,
} from 'pages/stats/dashboards/types'
import { useFiltersFromDashboard } from 'pages/stats/dashboards/useFiltersFromDashboard'
import { updateChartPosition } from 'pages/stats/dashboards/utils'
import { OverviewMetric } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { RootState } from 'state/types'
import { initialState } from 'state/ui/stats/filtersSlice'
import { assumeMock, renderWithStore } from 'utils/testing'
import { DndProvider } from 'utils/wrappers/DndProvider'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))
jest.mock('pages/stats/common/drill-down/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('@gorgias/helpdesk-queries')
const useGetAnalyticsCustomReportMock = assumeMock(useGetAnalyticsCustomReport)

jest.mock('pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper')
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)
jest.mock('pages/stats/dashboards/DashboardChart')
const DashboardChartMock = assumeMock(DashboardChart)
jest.mock('pages/stats/dashboards/DashboardsSection')
const DashboardsSectionMock = assumeMock(DashboardsSection)
jest.mock('pages/stats/dashboards/useFiltersFromDashboard')
const useFiltersFromDashboardMock = assumeMock(useFiltersFromDashboard)

describe('Dashboard', () => {
    const section: DashboardSectionSchema = {
        children: [],
        type: DashboardChildType.Section,
    }
    const chart1: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: OverviewMetric.TicketsCreated,
    }
    const chart2: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: OverviewMetric.TicketsClosed,
    }

    const row: DashboardRowSchema = {
        type: DashboardChildType.Row,
        children: [chart1, chart2],
    }
    const dashboard: DashboardSchema = {
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
            state,
        )
    }

    beforeEach(() => {
        FiltersPanelWrapperMock.mockReturnValue(<div />)
        DashboardsSectionMock.mockReturnValue(<div />)
        DashboardChartMock.mockReturnValue(<div />)
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
            <Dashboard
                onChartMove={jest.fn()}
                onChartMoveEnd={jest.fn()}
                dashboard={dashboard}
            />,
        )

        expect(DashboardChartMock).toHaveBeenCalled()

        expect(useFiltersFromDashboardMock).toHaveBeenCalledWith(dashboard)
    })

    it('calls onChartMove with correct parameters when moving chart', () => {
        const onChartMove = jest.fn()

        renderComponent(
            <Dashboard
                onChartMove={onChartMove}
                onChartMoveEnd={jest.fn()}
                dashboard={dashboard}
            />,
        )

        const chartProps = DashboardChartMock.mock.calls[0][0]

        const srcId = chart1.config_id
        const targetId = chart2.config_id

        ;(
            chartProps.onMove as (
                srcId: string,
                targetId: string,
                position: 'after' | 'before',
            ) => void
        )(srcId, targetId, 'after')

        expect(onChartMove).toHaveBeenCalledWith(
            updateChartPosition(dashboard, srcId, targetId, 'after'),
        )
    })

    it('calls onChartMoveEnd when chart is dropped', () => {
        const onChartMoveEnd = jest.fn()

        renderComponent(
            <Dashboard
                onChartMove={jest.fn()}
                onChartMoveEnd={onChartMoveEnd}
                dashboard={dashboard}
            />,
        )

        const chartProps = DashboardChartMock.mock.calls[0][0]

        ;(chartProps.onDrop as () => void)()

        expect(onChartMoveEnd).toHaveBeenCalled()
    })

    it('_findChartIndex correctly delegates to findChartIndex', () => {
        renderComponent(
            <Dashboard
                onChartMove={jest.fn()}
                onChartMoveEnd={jest.fn()}
                dashboard={dashboard}
            />,
        )

        const chartProps = DashboardChartMock.mock.calls[0][0]
        const result = chartProps.findChartIndex('some-chart-id')

        expect(result).toBe(findChartIndex(dashboard, 'some-chart-id'))
    })
})

describe('findChartIndex', () => {
    const chart1: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: 'chart1',
    }
    const chart2: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: 'chart2',
    }
    const chart3: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: 'chart3',
    }

    it('finds chart in root level', () => {
        const dashboard: DashboardSchema = {
            id: 1,
            analytics_filter_id: 1,
            name: 'test',
            emoji: null,
            children: [chart1, chart2],
        }

        expect(findChartIndex(dashboard, 'chart2')).toBe(1)
    })

    it('finds chart in nested row', () => {
        const dashboard: DashboardSchema = {
            id: 1,
            analytics_filter_id: 1,
            name: 'test',
            emoji: null,
            children: [
                {
                    type: DashboardChildType.Row,
                    children: [chart1, chart2],
                },
            ],
        }

        expect(findChartIndex(dashboard, 'chart2')).toBe(1)
    })

    it('finds chart in nested section', () => {
        const dashboard: DashboardSchema = {
            id: 1,
            analytics_filter_id: 1,
            name: 'test',
            emoji: null,
            children: [
                {
                    type: DashboardChildType.Section,
                    children: [chart1, chart2, chart3],
                },
            ],
        }

        expect(findChartIndex(dashboard, 'chart3')).toBe(2)
    })

    it('returns -1 when chart is not found', () => {
        const dashboard: DashboardSchema = {
            id: 1,
            analytics_filter_id: 1,
            name: 'test',
            emoji: null,
            children: [chart1, chart2],
        }

        expect(findChartIndex(dashboard, 'non-existent')).toBe(-1)
    })

    it('finds chart in deeply nested structure', () => {
        const dashboard: DashboardSchema = {
            id: 1,
            analytics_filter_id: 1,
            name: 'test',
            emoji: null,
            children: [
                {
                    type: DashboardChildType.Section,
                    children: [
                        {
                            type: DashboardChildType.Row,
                            children: [chart1, chart2],
                        },
                        {
                            type: DashboardChildType.Row,
                            children: [chart3],
                        },
                    ],
                },
            ],
        }

        expect(findChartIndex(dashboard, 'chart3')).toBe(0)
    })
})
