import { renderHook } from '@testing-library/react-hooks'

import { useSanitizedDashboard } from 'hooks/reporting/custom-reports/useSanitizedDashboard'
import {
    CustomReportChartSchema,
    CustomReportRowSchema,
} from 'models/stat/types'
import {
    CustomReportChildType,
    CustomReportSchema,
    CustomReportSectionSchema,
} from 'pages/stats/custom-reports/types'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('useSanitizedDashboard', () => {
    beforeEach(() => {})
    it('should return dashboard unchanged when no restrictions exist', () => {
        const dashboard: CustomReportSchema = {
            id: 1,
            name: 'Test Dashboard',
            emoji: '🚀',
            analytics_filter_id: null,
            children: [
                {
                    type: CustomReportChildType.Chart,
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
        const dashboard: CustomReportSchema = {
            id: 1,
            name: 'Test Dashboard',
            emoji: '🚀',
            analytics_filter_id: null,
            children: [
                {
                    type: CustomReportChildType.Chart,
                    config_id: 'customer_satisfaction_trend_card',
                },
                {
                    type: CustomReportChildType.Chart,
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

        const charts = result.current.children as CustomReportChartSchema[]
        expect(charts).toHaveLength(1)
        expect(charts[0].config_id).toBe('ticket-distribution-table')
    })

    it('should handle nested structures and remove restricted charts', () => {
        const dashboard: CustomReportSchema = {
            id: 1,
            name: 'Test Dashboard',
            emoji: '🚀',
            analytics_filter_id: null,
            children: [
                {
                    type: CustomReportChildType.Section,
                    children: [
                        {
                            type: CustomReportChildType.Row,
                            children: [
                                {
                                    type: CustomReportChildType.Chart,
                                    config_id:
                                        'customer_satisfaction_trend_card',
                                },
                                {
                                    type: CustomReportChildType.Chart,
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

        const section = result.current.children[0] as CustomReportSectionSchema
        const row = section.children[0] as CustomReportRowSchema
        const charts = row.children

        expect(section.type).toBe(CustomReportChildType.Section)

        expect(row.type).toBe(CustomReportChildType.Row)

        expect(charts).toHaveLength(1)

        expect(charts[0].config_id).toBe('ticket-distribution-table')
    })

    it('should preserve non-chart elements', () => {
        const dashboard: CustomReportSchema = {
            id: 1,
            name: 'Test Dashboard',
            emoji: '🚀',
            analytics_filter_id: null,
            children: [
                {
                    type: CustomReportChildType.Row,
                    children: [],
                },
                {
                    type: CustomReportChildType.Section,
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
