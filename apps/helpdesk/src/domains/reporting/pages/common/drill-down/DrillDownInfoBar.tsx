import { Box } from '@gorgias/axiom'

import type { DrillDownDataHook } from 'domains/reporting/hooks/useDrillDownData'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { DrillDownExportMenu } from 'domains/reporting/pages/common/drill-down/DrillDownExportMenu'
import type {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
    VoiceCallDrillDownRowData,
} from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import css from 'domains/reporting/pages/common/drill-down/DrillDownInfoBar.less'
import type {
    DomainConfig,
    InfoBarObjectType,
} from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import { singular } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'
import { DRILLDOWN_QUERY_LIMIT } from 'domains/reporting/utils/reporting'

const getTheInfoLabel = (
    totalResults: number,
    objectType: InfoBarObjectType,
    metricName?: string,
): string => {
    if (totalResults < DRILLDOWN_QUERY_LIMIT) {
        const displayType =
            totalResults === 1 ? singular(objectType) : objectType
        return `${totalResults} ${displayType}`
    }

    if (
        metricName === KnowledgeMetric.CSAT ||
        Object.values(AiAgentDrillDownMetricName).includes(
            metricName as AiAgentDrillDownMetricName,
        )
    ) {
        return `Displaying last ${DRILLDOWN_QUERY_LIMIT} ${objectType} used to compute the metric`
    }

    return `Displaying last ${DRILLDOWN_QUERY_LIMIT} ${objectType}`
}

export const DrillDownInfoBar = ({
    metricData,
    useDataHook,
    domainConfig,
}: {
    metricData: DrillDownMetric
    useDataHook: DrillDownDataHook<
        | TicketDrillDownRowData
        | ConvertDrillDownRowData
        | VoiceCallDrillDownRowData
    >
    domainConfig: DomainConfig<any>
}) => {
    const { isFetching, totalResults } = useDataHook(metricData)
    const objectType = domainConfig.infoBarObjectType
    const resultsPlaceholder = `Fetching ${objectType}...`
    const shouldDisplayDownloadButton = domainConfig.isMetricDataDownloadable

    return (
        <Box
            gap="sm"
            alignItems="center"
            justifyContent="space-between"
            className={css.wrapper}
        >
            <div className={css.text}>
                {isFetching
                    ? resultsPlaceholder
                    : getTheInfoLabel(
                          totalResults,
                          objectType,
                          metricData.metricName,
                      )}
            </div>
            {shouldDisplayDownloadButton && (
                <DrillDownExportMenu
                    metricData={metricData}
                    isFetching={isFetching}
                />
            )}
        </Box>
    )
}
