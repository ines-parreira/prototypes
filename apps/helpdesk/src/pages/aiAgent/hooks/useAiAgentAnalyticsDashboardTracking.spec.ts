import { logEvent, SegmentEvent } from '@repo/logging'
import { renderHook } from '@repo/testing'

import {
    ExportFormat,
    useAiAgentAnalyticsDashboardTracking,
} from './useAiAgentAnalyticsDashboardTracking'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AnalyticsReportViewed: 'Analytics Report Viewed',
        AnalyticsAiAgentTabSelected: 'Analytics AI Agent Tab Selected',
        ExportType: 'Export Type',
        TableTabInteraction: 'Table Tab Interaction',
    },
}))

describe('useAiAgentAnalyticsDashboardTracking', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return all tracking callbacks', () => {
        const { result } = renderHook(() =>
            useAiAgentAnalyticsDashboardTracking(),
        )

        expect(result.current.onAnalyticsReportViewed).toBeDefined()
        expect(typeof result.current.onAnalyticsReportViewed).toBe('function')
        expect(result.current.onAnalyticsAiAgentTabSelected).toBeDefined()
        expect(typeof result.current.onAnalyticsAiAgentTabSelected).toBe(
            'function',
        )
        expect(result.current.onExport).toBeDefined()
        expect(typeof result.current.onExport).toBe('function')
        expect(result.current.onTableTabInteraction).toBeDefined()
        expect(typeof result.current.onTableTabInteraction).toBe('function')
    })

    it('should log event with correct parameters onAnalyticsReportViewed', () => {
        const { result } = renderHook(() =>
            useAiAgentAnalyticsDashboardTracking(),
        )

        result.current.onAnalyticsReportViewed({
            reportName: 'AI Agent Overview',
            previousReport: 'Dashboard',
        })

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AnalyticsReportViewed,
            {
                report_name: 'AI Agent Overview',
                previous_report: 'Dashboard',
            },
        )
    })

    it('should log event with correct parameters onAnalyticsAiAgentTabSelected', () => {
        const { result } = renderHook(() =>
            useAiAgentAnalyticsDashboardTracking(),
        )

        result.current.onAnalyticsAiAgentTabSelected({
            tabName: 'Support Agent',
            previousTab: 'All Agents',
        })

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AnalyticsAiAgentTabSelected,
            {
                tab_name: 'Support Agent',
                previous_tab: 'All Agents',
            },
        )
    })

    it('should log event onExport with PDF format', () => {
        const { result } = renderHook(() =>
            useAiAgentAnalyticsDashboardTracking(),
        )

        result.current.onExport({ format: ExportFormat.PDF })

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.ExportType, {
            format: ExportFormat.PDF,
        })
    })

    it('should log event onExport with CSV format', () => {
        const { result } = renderHook(() =>
            useAiAgentAnalyticsDashboardTracking(),
        )

        result.current.onExport({ format: ExportFormat.CSV })

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.ExportType, {
            format: ExportFormat.CSV,
        })
    })

    it('should log event with correct parameters onTableTabInteraction', () => {
        const { result } = renderHook(() =>
            useAiAgentAnalyticsDashboardTracking(),
        )

        result.current.onTableTabInteraction({
            reportName: 'analytics-ai-agent/all-agent',
            tableTab: 'Metrics',
        })

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.TableTabInteraction,
            {
                report_name: 'analytics-ai-agent/all-agent',
                tab_tab: 'Metrics',
            },
        )
    })
})
