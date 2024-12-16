import {useAgentsMetrics} from 'hooks/reporting/support-performance/agents/useAgentsMetrics'
import {useAgentsSummaryMetrics} from 'hooks/reporting/support-performance/agents/useAgentsSummaryMetrics'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {saveReport} from 'services/reporting/agentsPerformanceReportingService'

export const useDownloadAgentsPerformanceData = () => {
    const {reportData, isLoading, period} = useAgentsMetrics()
    const {summaryData, isLoading: summaryIsLoading} = useAgentsSummaryMetrics()
    const {columnsOrder} = useAgentsTableConfigSetting()

    const {files, fileName} = saveReport(
        reportData,
        summaryData,
        columnsOrder,
        period
    )

    return {
        files,
        fileName,
        isLoading: isLoading || summaryIsLoading,
    }
}
