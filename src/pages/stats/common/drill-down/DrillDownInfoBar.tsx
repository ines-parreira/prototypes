import { DrillDownDataHook } from 'hooks/reporting/useDrillDownData'
import Loader from 'pages/common/components/Loader/Loader'
import { DrillDownDownloadButton } from 'pages/stats/common/drill-down/DrillDownDownloadButton'
import {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
    VoiceCallDrillDownRowData,
} from 'pages/stats/common/drill-down/DrillDownFormatters'
import css from 'pages/stats/common/drill-down/DrillDownInfobar.less'
import {
    getObjectType,
    isMetricDataDownloadable,
} from 'pages/stats/common/drill-down/helpers'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'
import { DRILLDOWN_QUERY_LIMIT } from 'utils/reporting'

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
}: {
    metricData: DrillDownMetric
    useDataHook: DrillDownDataHook<
        | TicketDrillDownRowData
        | ConvertDrillDownRowData
        | VoiceCallDrillDownRowData
    >
}) => {
    const { isFetching, totalResults } = useDataHook(metricData)
    const objectType = getObjectType(metricData)
    const resultsPlaceholder = `Fetching ${objectType}...`
    const shouldDisplayDownloadButton = isMetricDataDownloadable(metricData)

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
