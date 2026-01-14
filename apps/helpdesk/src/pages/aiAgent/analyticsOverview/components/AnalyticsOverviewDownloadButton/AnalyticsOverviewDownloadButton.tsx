import type { RefObject } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { Button, ButtonSize, IconName } from '@gorgias/axiom'

import { useExportDashboardToPDF } from 'pages/aiAgent/analyticsOverview/hooks/useExportDashboardToPDF'
import {
    ExportFormat,
    useAiAgentAnalyticsDashboardTracking,
} from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'

type AnalyticsOverviewDownloadButtonProps = {
    dashboardRef: RefObject<HTMLElement>
}

export const AnalyticsOverviewDownloadButton = ({
    dashboardRef,
}: AnalyticsOverviewDownloadButtonProps) => {
    const { exportToPDF, isLoading, isSuccess } = useExportDashboardToPDF()
    const { onExport } = useAiAgentAnalyticsDashboardTracking()

    const handleClick = async () => {
        logEvent(SegmentEvent.StatDownloadClicked, {
            name: 'analytics-overview',
        })
        onExport({ format: ExportFormat.PDF })

        await exportToPDF(dashboardRef)
    }

    const getButtonContent = () => {
        if (isLoading) {
            return 'Exporting...'
        }
        if (isSuccess) {
            return 'Exported'
        }
        return 'Export'
    }

    const getButtonIcon = (): IconName => {
        if (isSuccess) {
            return IconName.Check
        }
        return IconName.Download
    }

    return (
        <Button
            variant="primary"
            size={ButtonSize.Md}
            onClick={handleClick}
            isDisabled={isLoading}
            leadingSlot={getButtonIcon()}
            style={{
                backgroundColor: 'var(--surface-inverted-default)',
                borderColor: 'var(--surface-inverted-default)',
            }}
        >
            {getButtonContent()}
        </Button>
    )
}
