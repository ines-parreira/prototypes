import { useCallback } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

export enum ExportFormat {
    PDF = 'pdf',
    CSV = 'csv',
}

interface AiAgentAnalyticsDashboardTrackingCallbacks {
    onAnalyticsReportViewed: ({
        reportName,
        previousReport,
    }: {
        reportName: string
        previousReport: string
    }) => void
    onAnalyticsAiAgentTabSelected: ({
        tabName,
        previousTab,
    }: {
        tabName: string
        previousTab: string
    }) => void
    onExport: ({ format }: { format: ExportFormat }) => void
    onTableTabInteraction: ({
        reportName,
        tableTab,
    }: {
        reportName: string
        tableTab: string
    }) => void
}

export const useAiAgentAnalyticsDashboardTracking =
    (): AiAgentAnalyticsDashboardTrackingCallbacks => {
        const onAnalyticsReportViewed = useCallback(
            ({
                reportName,
                previousReport,
            }: {
                reportName: string
                previousReport: string
            }) => {
                logEvent(SegmentEvent.AnalyticsReportViewed, {
                    report_name: reportName,
                    previous_report: previousReport,
                })
            },
            [],
        )

        const onAnalyticsAiAgentTabSelected = useCallback(
            ({
                tabName,
                previousTab,
            }: {
                tabName: string
                previousTab: string
            }) => {
                logEvent(SegmentEvent.AnalyticsAiAgentTabSelected, {
                    tab_name: tabName,
                    previous_tab: previousTab,
                })
            },
            [],
        )

        const onExport = useCallback(({ format }: { format: ExportFormat }) => {
            logEvent(SegmentEvent.ExportType, {
                format,
            })
        }, [])

        const onTableTabInteraction = useCallback(
            ({
                reportName,
                tableTab,
            }: {
                reportName: string
                tableTab: string
            }) => {
                logEvent(SegmentEvent.TableTabInteraction, {
                    report_name: reportName,
                    tab_tab: tableTab,
                })
            },
            [],
        )

        return {
            onAnalyticsReportViewed,
            onAnalyticsAiAgentTabSelected,
            onExport,
            onTableTabInteraction,
        }
    }
