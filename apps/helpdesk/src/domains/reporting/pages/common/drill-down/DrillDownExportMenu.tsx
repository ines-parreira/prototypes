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
import { useDrillDownQueryWithoutLimit } from 'domains/reporting/hooks/useDrillDownData'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    DATA_LOADING_CONTENT,
    DOWNLOAD_LOADING_LABEL,
    DOWNLOAD_REQUESTED_LABEL,
    EXPORT_WARNING_DESCRIPTION,
    EXPORT_WARNING_TITLE,
    NO_PERMISSIONS_CONTENT,
    OPERATION_IN_PROGRESS_CONTENT,
} from 'domains/reporting/pages/common/drill-down/constants'
import css from 'domains/reporting/pages/common/drill-down/DrillDownExportMenu.less'
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    createExportDrillDownJob,
    getDrillDownExport,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import { getCleanStatsFilters } from 'domains/reporting/state/ui/stats/selectors'
import { ConvertMetric } from 'domains/reporting/state/ui/stats/types'
import { isPeriodExceedingDays } from 'domains/reporting/utils/reporting'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useRunningJobs } from 'jobs'
import type { JobContext } from 'models/job/types'
import { JobType } from 'models/job/types'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

export {
    DOWNLOAD_LOADING_LABEL,
    DOWNLOAD_REQUESTED_LABEL,
} from 'domains/reporting/pages/common/drill-down/constants'

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

export const DrillDownExportMenu = ({
    metricData,
    isFetching = false,
}: {
    metricData: DrillDownMetric
    isFetching?: boolean
}) => {
    const dispatch = useAppDispatch()
    const { isLoading, isError, isRequested } =
        useAppSelector(getDrillDownExport)
    const currentUser = useAppSelector(getCurrentUser)
    const { running } = useRunningJobs()
    const hasNoPermissions = !(
        hasRole(currentUser, UserRole.Admin) ||
        hasRole(currentUser, UserRole.Agent)
    )
    const isDisabled =
        hasNoPermissions || isLoading || running !== false || isFetching
    const cleanStatsFilters = useAppSelector(getCleanStatsFilters)
    const period = cleanStatsFilters?.[FilterKey.Period]
    const isPeriodExceedingOneMonth = period
        ? isPeriodExceedingDays(period, 30)
        : false
    const query = useDrillDownQueryWithoutLimit(
        metricData,
        getDrillDownQuery(metricData),
    )

    const isExportSuccess = isRequested && !isError

    const clickHandler = (addMessagesText = false) => {
        void dispatch(
            createExportDrillDownJob({
                query,
                jobType: getDrillDownJobType(metricData),
                context: getDrillDownJobContext(metricData),
                addMessagesText,
            }),
        )
    }

    const getButtonIcon = () => {
        if (isExportSuccess) return 'check'
        return 'download'
    }

    const getButtonText = () => {
        if (isLoading) return DOWNLOAD_LOADING_LABEL
        if (isExportSuccess) return DOWNLOAD_REQUESTED_LABEL
        return 'Export'
    }

    const tooltipMessage = isFetching
        ? DATA_LOADING_CONTENT
        : running !== false
          ? OPERATION_IN_PROGRESS_CONTENT
          : NO_PERMISSIONS_CONTENT

    return (
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
                            isExportSuccess ? css.successButton : undefined
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
                                    <Icon name="arrow-chevron-down" size="sm" />
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
                onAction={() => clickHandler()}
            />
            <MenuItem
                label="Export with message content"
                caption="Full ticket body included — limited to 1 month of data"
                leadingSlot="chat-dots"
                isDisabled={isDisabled}
                onAction={() => clickHandler(true)}
            />
            {isPeriodExceedingOneMonth && (
                <MenuItem asSlot>
                    <div className={css.warningBanner}>
                        <span className={css.warningIcon}>
                            <Icon name="warning-triangle" color="orange-800" />
                        </span>
                        <div>
                            <div className={css.warningTitle}>
                                {EXPORT_WARNING_TITLE}
                            </div>
                            <div className={css.warningDescription}>
                                {EXPORT_WARNING_DESCRIPTION}
                            </div>
                        </div>
                    </div>
                </MenuItem>
            )}
        </Menu>
    )
}
