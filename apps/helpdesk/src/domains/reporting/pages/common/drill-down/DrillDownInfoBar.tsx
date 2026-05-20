import {
    Box,
    Button,
    Icon,
    Menu,
    MenuItem,
    MenuPlacement,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { UserRole } from 'config/types/user'
import type { DrillDownDataHook } from 'domains/reporting/hooks/useDrillDownData'
import { useDrillDownQueryWithoutLimit } from 'domains/reporting/hooks/useDrillDownData'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
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
import { getCleanStatsFilters } from 'domains/reporting/state/ui/stats/selectors'
import {
    ConvertMetric,
    KnowledgeMetric,
} from 'domains/reporting/state/ui/stats/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    isPeriodExceedingDays,
} from 'domains/reporting/utils/reporting'
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

    const cleanStatsFilters = useAppSelector(getCleanStatsFilters)
    const period = cleanStatsFilters?.[FilterKey.Period]
    const isPeriodExceedingOneMonth = period
        ? isPeriodExceedingDays(period, 30)
        : false

    const hasNoPermissions = !(
        hasRole(currentUser, UserRole.Admin) ||
        hasRole(currentUser, UserRole.Agent)
    )
    const isDisabled = hasNoPermissions || isLoading || running !== false

    const isExportSuccess = isRequested && !isError

    const getButtonIcon = () => {
        if (isExportSuccess) {
            return 'check'
        }
        return 'download'
    }

    const getButtonText = () => {
        if (isLoading) {
            return DOWNLOAD_LOADING_LABEL
        }
        if (isExportSuccess) {
            return DOWNLOAD_REQUESTED_LABEL
        }
        return 'Export'
    }

    const handleExportClick = (addMessagesText = false) => {
        void dispatch(
            createExportDrillDownJob({
                query,
                jobType: getDrillDownJobType(metricData),
                context: getDrillDownJobContext(metricData),
                addMessagesText,
            }),
        )
    }

    const tooltipMessage =
        running !== false
            ? OPERATION_IN_PROGRESS_CONTENT
            : NO_PERMISSIONS_CONTENT

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
                <Menu
                    placement={MenuPlacement.BottomRight}
                    aria-label="Export options"
                    trigger={({ isOpen }) => {
                        const button = (
                            <Button
                                variant="primary"
                                size="sm"
                                leadingSlot={getButtonIcon()}
                                isDisabled={isDisabled || isExportSuccess}
                                className={
                                    isExportSuccess
                                        ? css.successButton
                                        : undefined
                                }
                            >
                                <Box display="flex" alignItems="center">
                                    {getButtonText()}
                                    {!isExportSuccess && !isLoading && (
                                        <span
                                            className={
                                                isOpen
                                                    ? `${css.chevronSeparator} ${css.chevronRotated}`
                                                    : css.chevronSeparator
                                            }
                                        >
                                            <Icon
                                                name="arrow-chevron-down"
                                                size="sm"
                                            />
                                        </span>
                                    )}
                                </Box>
                            </Button>
                        )
                        if (!isDisabled) return button
                        return (
                            <Tooltip trigger={button}>
                                <TooltipContent caption={tooltipMessage} />
                            </Tooltip>
                        )
                    }}
                >
                    <MenuItem
                        label="Export metadata only"
                        caption="ID, date, assignee, status — up to 2.5 years of data"
                        leadingSlot="system-data"
                        isDisabled={isDisabled}
                        onAction={() => handleExportClick()}
                    />
                    <MenuItem
                        label="Export with message content"
                        caption="Full ticket body included — limited to 1 month of data"
                        leadingSlot="chat-dots"
                        isDisabled={isDisabled}
                        onAction={() => handleExportClick(true)}
                    />
                    {isPeriodExceedingOneMonth && (
                        <MenuItem asSlot>
                            <div className={css.warningBanner}>
                                <span className={css.warningIcon}>
                                    <Icon
                                        name="warning-triangle"
                                        color="orange-800"
                                    />
                                </span>
                                <div>
                                    <div className={css.warningTitle}>
                                        Your date range exceeds 1 month. The
                                        most recent 30 days will be exported.
                                    </div>
                                    <div className={css.warningDescription}>
                                        To choose a different range, adjust the
                                        date filter on the AI Agent page.
                                    </div>
                                </div>
                            </div>
                        </MenuItem>
                    )}
                </Menu>
            )}
        </Box>
    )
}
