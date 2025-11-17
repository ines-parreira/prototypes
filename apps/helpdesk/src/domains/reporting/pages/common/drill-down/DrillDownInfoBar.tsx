import type { DrillDownDataHook } from 'domains/reporting/hooks/useDrillDownData'
import { DrillDownDownloadButton } from 'domains/reporting/pages/common/drill-down/DrillDownDownloadButton'
import type {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
    VoiceCallDrillDownRowData,
} from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import css from 'domains/reporting/pages/common/drill-down/DrillDownInfobar.less'
import type { DomainConfig } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { DRILLDOWN_QUERY_LIMIT } from 'domains/reporting/utils/reporting'
import Loader from 'pages/common/components/Loader/Loader'

const getTheInfoLabel = (totalResults: number, objectType: string) => {
    if (totalResults < DRILLDOWN_QUERY_LIMIT) {
        return (
            <>
                <strong>{totalResults}</strong> {objectType} are displayed.
            </>
        )
    }
    return (
        <>
            Displaying (first) <strong>{DRILLDOWN_QUERY_LIMIT}</strong>{' '}
            {objectType} used to compute the metric.
        </>
    )
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
        <div className={css.wrapper}>
            <div className={css.icon}>
                {isFetching ? (
                    <Loader size="14px" minHeight="14px" />
                ) : (
                    <i className="material-icons">info</i>
                )}
            </div>
            <div className={css.text}>
                {isFetching
                    ? resultsPlaceholder
                    : getTheInfoLabel(totalResults, objectType)}
            </div>
            {shouldDisplayDownloadButton && (
                <DrillDownDownloadButton
                    metricData={metricData}
                    objectType={objectType}
                />
            )}
        </div>
    )
}
