import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

type DownloadData = {
    files: Record<string, string>
    fileName: string
    isLoading: boolean
}

type UseBreakdownTableActionsParams = {
    chartId?: string
    withChartMenu?: boolean
    dashboard?: DashboardSchema
    chartName: string
    segmentEventName: string
    useDownloadData: () => DownloadData
}

export const useBreakdownTableActions = ({
    chartId,
    withChartMenu,
    dashboard,
    chartName,
    segmentEventName,
    useDownloadData,
}: UseBreakdownTableActionsParams) => {
    const downloadData = useDownloadData()
    const exportCsvAction = useDownloadTableAction({
        ...downloadData,
        segmentEventName,
    })
    const withMenu = withChartMenu && chartId

    const DownloadButton = !withMenu ? (
        <DownloadTableButton
            {...downloadData}
            segmentEventName={segmentEventName}
        />
    ) : undefined

    const actionMenu = withMenu ? (
        <ChartsActionMenu
            chartId={chartId}
            chartName={chartName}
            dashboard={dashboard}
            exportCsvAction={exportCsvAction}
        />
    ) : undefined

    return { DownloadButton, actionMenu }
}
