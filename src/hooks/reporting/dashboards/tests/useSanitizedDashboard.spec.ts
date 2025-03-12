import { renderHook } from '@testing-library/react-hooks'

import { useSanitizedDashboard } from 'hooks/reporting/dashboards/useSanitizedDashboard'
import {
    DashboardChartSchema,
    DashboardChildType,
    DashboardRowSchema,
    DashboardSchema,
    DashboardSectionSchema,
} from 'pages/stats/dashboards/types'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
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
                    config_id: 'customer_satisfaction_trend_card',
                },
            ],
        }

        useReportChartRestrictionsMock.mockImplementation(() => ({
            isChartRestrictedToCurrentUser: () => false,
            isRouteRestrictedToCurrentUser: () => false,
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
                    config_id: 'customer_satisfaction_trend_card',
                },
                {
                    type: DashboardChildType.Chart,
                    config_id: 'ticket-distribution-table',
                },
            ],
        }

        useReportChartRestrictionsMock.mockImplementation(() => ({
            isChartRestrictedToCurrentUser: (chartId) =>
                chartId === 'customer_satisfaction_trend_card',
            isRouteRestrictedToCurrentUser: () => true,
        }))

        const { result } = renderHook(() => useSanitizedDashboard(dashboard))

        const charts = result.current.children as DashboardChartSchema[]
        expect(charts).toHaveLength(1)
        expect(charts[0].config_id).toBe('ticket-distribution-table')
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
                                        'customer_satisfaction_trend_card',
                                },
                                {
                                    type: DashboardChildType.Chart,
                                    config_id: 'ticket-distribution-table',
                                },
                            ],
                        },
                    ],
                },
            ],
        }

        useReportChartRestrictionsMock.mockImplementation(() => ({
            isChartRestrictedToCurrentUser: (chartId) =>
                chartId === 'customer_satisfaction_trend_card',
            isRouteRestrictedToCurrentUser: () => true,
        }))

        const { result } = renderHook(() => useSanitizedDashboard(dashboard))

        const section = result.current.children[0] as DashboardSectionSchema
        const row = section.children[0] as DashboardRowSchema
        const charts = row.children

        expect(section.type).toBe(DashboardChildType.Section)

        expect(row.type).toBe(DashboardChildType.Row)

        expect(charts).toHaveLength(1)

        expect(charts[0].config_id).toBe('ticket-distribution-table')
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
            isRouteRestrictedToCurrentUser: () => false,
        }))

        const { result } = renderHook(() => useSanitizedDashboard(dashboard))

        expect(result.current).toEqual(dashboard)
    })
})
