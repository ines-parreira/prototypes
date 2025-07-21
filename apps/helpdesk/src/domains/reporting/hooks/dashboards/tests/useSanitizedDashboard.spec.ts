import { useSanitizedDashboard } from 'domains/reporting/hooks/dashboards/useSanitizedDashboard'
import {
    DashboardChartSchema,
    DashboardChildType,
    DashboardRowSchema,
    DashboardSchema,
    DashboardSectionSchema,
} from 'domains/reporting/pages/dashboards/types'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { OverviewChart } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { TicketFieldsChart } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('useSanitizedDashboard', () => {
    beforeEach(() => {})
    it('should return dashboard unchanged when no restrictions exist', () => {
        const dashboard: DashboardSchema = {
            id: 1,
            name: 'Test Dashboard',
            emoji: '🚀',
            analytics_filter_id: null,
            children: [
                {
                    type: DashboardChildType.Chart,
                    config_id: OverviewChart.CustomerSatisfactionTrendCard,
                },
            ],
        }

        useReportChartRestrictionsMock.mockImplementation(() => ({
            isChartRestrictedToCurrentUser: () => false,
            isReportRestrictedToCurrentUser: () => true,
            isRouteRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        }))

        const { result } = renderHook(() => useSanitizedDashboard(dashboard))
        expect(result.current).toEqual(dashboard)
    })

    it('should remove restricted charts', () => {
        const dashboard: DashboardSchema = {
            id: 1,
            name: 'Test Dashboard',
            emoji: '🚀',
            analytics_filter_id: null,
            children: [
                {
                    type: DashboardChildType.Chart,
                    config_id: OverviewChart.CustomerSatisfactionTrendCard,
                },
                {
                    type: DashboardChildType.Chart,
                    config_id: TicketFieldsChart.TicketDistributionTable,
                },
            ],
        }

        useReportChartRestrictionsMock.mockImplementation(() => ({
            isChartRestrictedToCurrentUser: (chartId) =>
                chartId === OverviewChart.CustomerSatisfactionTrendCard,
            isReportRestrictedToCurrentUser: () => true,
            isRouteRestrictedToCurrentUser: () => true,
            isModuleRestrictedToCurrentUser: () => false,
        }))

        const { result } = renderHook(() => useSanitizedDashboard(dashboard))

        const charts = result.current.children as DashboardChartSchema[]
        expect(charts).toHaveLength(1)
        expect(charts[0].config_id).toBe(
            TicketFieldsChart.TicketDistributionTable,
        )
    })

    it('should handle nested structures and remove restricted charts', () => {
        const dashboard: DashboardSchema = {
            id: 1,
            name: 'Test Dashboard',
            emoji: '🚀',
            analytics_filter_id: null,
            children: [
                {
                    type: DashboardChildType.Section,
                    children: [
                        {
                            type: DashboardChildType.Row,
                            children: [
                                {
                                    type: DashboardChildType.Chart,
                                    config_id:
                                        OverviewChart.CustomerSatisfactionTrendCard,
                                },
                                {
                                    type: DashboardChildType.Chart,
                                    config_id:
                                        TicketFieldsChart.TicketDistributionTable,
                                },
                            ],
                        },
                    ],
                },
            ],
        }

        useReportChartRestrictionsMock.mockImplementation(() => ({
            isChartRestrictedToCurrentUser: (chartId) =>
                chartId === OverviewChart.CustomerSatisfactionTrendCard,
            isReportRestrictedToCurrentUser: () => false,
            isRouteRestrictedToCurrentUser: () => true,
            isModuleRestrictedToCurrentUser: () => false,
        }))

        const { result } = renderHook(() => useSanitizedDashboard(dashboard))

        const section = result.current.children[0] as DashboardSectionSchema
        const row = section.children[0] as DashboardRowSchema
        const charts = row.children

        expect(section.type).toBe(DashboardChildType.Section)

        expect(row.type).toBe(DashboardChildType.Row)

        expect(charts).toHaveLength(1)

        expect(charts[0].config_id).toBe(
            TicketFieldsChart.TicketDistributionTable,
        )
    })

    it('should preserve non-chart elements', () => {
        const dashboard: DashboardSchema = {
            id: 1,
            name: 'Test Dashboard',
            emoji: '🚀',
            analytics_filter_id: null,
            children: [
                {
                    type: DashboardChildType.Row,
                    children: [],
                },
                {
                    type: DashboardChildType.Section,
                    children: [],
                },
            ],
        }

        useReportChartRestrictionsMock.mockImplementation(() => ({
            isChartRestrictedToCurrentUser: () => false,
            isReportRestrictedToCurrentUser: () => false,
            isRouteRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        }))

        const { result } = renderHook(() => useSanitizedDashboard(dashboard))

        expect(result.current).toEqual(dashboard)
    })
})
