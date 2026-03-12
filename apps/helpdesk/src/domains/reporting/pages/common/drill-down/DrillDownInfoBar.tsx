import { Box, Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { UserRole } from 'config/types/user'
import type { DrillDownDataHook } from 'domains/reporting/hooks/useDrillDownData'
import { useDrillDownQueryWithoutLimit } from 'domains/reporting/hooks/useDrillDownData'
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
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    createExportDrillDownJob,
    getDrillDownExport,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    ConvertMetric,
    KnowledgeMetric,
} from 'domains/reporting/state/ui/stats/types'
import { DRILLDOWN_QUERY_LIMIT } from 'domains/reporting/utils/reporting'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useRunningJobs } from 'jobs'
import type { JobContext } from 'models/job/types'
import { JobType } from 'models/job/types'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

const DOWNLOAD_REQUESTED_LABEL = 'Download Requested'
const DOWNLOAD_LOADING_LABEL = 'Loading'
const NO_PERMISSIONS_CONTENT =
    "You don't have enough permissions to download this content."
const OPERATION_IN_PROGRESS_CONTENT =
    'A long-running job (e.g., ticket export, bulk action) is currently in progress on your account. Please wait until it is finished before requesting a new export.'

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

    if (metricName === KnowledgeMetric.CSAT) {
        return `Displaying last ${DRILLDOWN_QUERY_LIMIT} ${objectType} used to compute the metric`
    }

    return `Displaying last ${DRILLDOWN_QUERY_LIMIT} ${objectType}`
}

const getDrillDownJobType = (
    metricData: DrillDownMetric,
):
    | JobType.ExportConvertCampaignSalesDrilldown
    | JobType.ExportTicketDrilldown => {
    switch (metricData.metricName) {
        case ConvertMetric.CampaignSalesCount:
            return JobType.ExportConvertCampaignSalesDrilldown
        default:
            return JobType.ExportTicketDrilldown
    }
}

const getDrillDownJobContext = (
    metricData: DrillDownMetric,
): JobContext | undefined => {
    switch (metricData.metricName) {
        case ConvertMetric.CampaignSalesCount:
            return metricData.context
        default:
            return undefined
    }
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
    const dispatch = useAppDispatch()
    const { isFetching, totalResults } = useDataHook(metricData)
    const objectType = domainConfig.infoBarObjectType
    const resultsPlaceholder = `Fetching ${objectType}...`
    const shouldDisplayDownloadButton = domainConfig.isMetricDataDownloadable

    const { isLoading, isError, isRequested } =
        useAppSelector(getDrillDownExport)
    const currentUser = useAppSelector(getCurrentUser)
    const { running } = useRunningJobs()
    const query = useDrillDownQueryWithoutLimit(
        metricData,
        getDrillDownQuery(metricData),
    )

    const hasNoPermissions = !(
        hasRole(currentUser, UserRole.Admin) ||
        hasRole(currentUser, UserRole.Agent)
    )
    const isDisabled = hasNoPermissions || isLoading || running !== false

    const getButtonIcon = () => {
        if (isRequested && !isError) {
            return 'check'
        }
        return 'download'
    }

    const getButtonText = () => {
        if (isLoading) {
            return DOWNLOAD_LOADING_LABEL
        }
        if (isRequested && !isError) {
            return DOWNLOAD_REQUESTED_LABEL
        }
        if (totalResults < DRILLDOWN_QUERY_LIMIT) {
            return 'Export'
        }
        return `Export all ${objectType}`
    }

    const handleDownloadClick = () => {
        void dispatch(
            createExportDrillDownJob({
                query,
                jobType: getDrillDownJobType(metricData),
                context: getDrillDownJobContext(metricData),
            }),
        )
    }

    const tooltipMessage =
        running !== false
            ? OPERATION_IN_PROGRESS_CONTENT
            : NO_PERMISSIONS_CONTENT

    return (
        <Box gap="sm" alignItems="center" className={css.wrapper}>
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
                <Tooltip
                    trigger={
                        <Button
                            variant="primary"
                            size="sm"
                            leadingSlot={getButtonIcon()}
                            isDisabled={isDisabled}
                            className={
                                isRequested && !isError
                                    ? css.successButton
                                    : undefined
                            }
                            {...(!isRequested && {
                                onClick: handleDownloadClick,
                            })}
                        >
                            {getButtonText()}
                        </Button>
                    }
                >
                    {isDisabled && <TooltipContent caption={tooltipMessage} />}
                </Tooltip>
            )}
        </Box>
    )
}
