import { Tooltip } from '@gorgias/merchant-ui-kit'

import { UserRole } from 'config/types/user'
import { useDrillDownQueryWithoutLimit } from 'hooks/reporting/useDrillDownData'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useRunningJobs } from 'jobs'
import { JobContext, JobType } from 'models/job/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import css from 'pages/stats/common/drill-down/DrillDownDownloadButton.less'
import { getDrillDownQuery } from 'pages/stats/common/drill-down/helpers'
import { getCurrentUser } from 'state/currentUser/selectors'
import {
    createExportDrillDownJob,
    DrillDownMetric,
    getDrillDownExport,
} from 'state/ui/stats/drillDownSlice'
import { ConvertMetric } from 'state/ui/stats/types'
import { hasRole } from 'utils'

export const DOWNLOAD_REQUESTED_LABEL = 'Download Requested'
export const TOTAL_OBJECTS_COUNT_PLACEHOLDER = 'All'
export const DOWNLOAD_LOADING_LABEL = 'Loading'
const NO_PERMISSIONS_CONTENT =
    'You don’t have enough permissions to download this content.'
const OPERATION_IN_PROGRESS_CONTENT =
    'A long-running job (e.g., ticket export, bulk action) is currently in progress on your account. Please wait until it is finished before requesting a new export.'
const tooltipTargetID = 'download-drill-down-tooltip'

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

export const DrillDownDownloadButton = ({
    metricData,
    objectType,
}: {
    metricData: DrillDownMetric
    objectType: string
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
    const isDisabled = hasNoPermissions || isLoading || running !== false
    const query = useDrillDownQueryWithoutLimit(
        metricData,
        getDrillDownQuery(metricData),
    )

    const clickHandler = () => {
        void dispatch(
            createExportDrillDownJob({
                query,
                jobType: getDrillDownJobType(metricData),
                context: getDrillDownJobContext(metricData),
            }),
        )
    }

    return (
        <>
            <Button
                id={tooltipTargetID}
                isDisabled={isDisabled}
                fillStyle="ghost"
                {...(!isRequested && {
                    onClick: clickHandler,
                })}
            >
                {getButtonVariant(objectType, isRequested, isLoading, isError)}
            </Button>
            <Tooltip
                disabled={!isDisabled}
                target={tooltipTargetID}
                trigger={['hover']}
            >
                {running !== false
                    ? OPERATION_IN_PROGRESS_CONTENT
                    : NO_PERMISSIONS_CONTENT}
            </Tooltip>
        </>
    )
}

export const getButtonVariant = (
    objectType: string,
    isRequested: boolean,
    exportRequestLoading: boolean,
    isError: boolean,
) => {
    if (exportRequestLoading) {
        return (
            <ButtonIconLabel icon="download" position="left">
                {DOWNLOAD_LOADING_LABEL}
            </ButtonIconLabel>
        )
    }

    if (isRequested && !isError) {
        return (
            <ButtonIconLabel
                className={css.success}
                icon={'check'}
                position="left"
            >
                {DOWNLOAD_REQUESTED_LABEL}
            </ButtonIconLabel>
        )
    }

    return (
        <ButtonIconLabel icon="download" position="left">
            {`Download ${TOTAL_OBJECTS_COUNT_PLACEHOLDER} ${objectType}`}
        </ButtonIconLabel>
    )
}
