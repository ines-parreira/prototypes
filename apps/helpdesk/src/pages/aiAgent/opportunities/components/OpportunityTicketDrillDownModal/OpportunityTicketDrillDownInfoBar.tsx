import classNames from 'classnames'

import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

import { UserRole } from 'config/types/user'
import css from 'domains/reporting/pages/common/drill-down/LegacyDrillDownInfobar.less'
import useAppSelector from 'hooks/useAppSelector'
import { useRunningJobs } from 'jobs'
import Loader from 'pages/common/components/Loader/Loader'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

import localCss from './OpportunityTicketDrillDownInfoBar.less'

const DRILLDOWN_QUERY_LIMIT = 100
const DOWNLOAD_REQUESTED_LABEL = 'Download Requested'
const DOWNLOAD_LOADING_LABEL = 'Loading'
const NO_PERMISSIONS_CONTENT =
    "You don't have enough permissions to download this content."
const OPERATION_IN_PROGRESS_CONTENT =
    'A long-running job (e.g., ticket export, bulk action) is currently in progress on your account. Please wait until it is finished before requesting a new export.'
const tooltipTargetID = 'download-opportunity-tickets-tooltip'

interface OpportunityTicketDrillDownInfoBarProps {
    totalTickets: number
    isLoading: boolean
    onDownload: () => void
    isDownloading: boolean
    isDownloadRequested: boolean
    isDownloadError: boolean
}

const getInfoLabel = (totalResults: number) => {
    if (totalResults < DRILLDOWN_QUERY_LIMIT) {
        return (
            <>
                <strong>{totalResults}</strong> tickets are displayed.
            </>
        )
    }
    return (
        <>
            Displaying (first) <strong>{DRILLDOWN_QUERY_LIMIT}</strong> tickets
            used to compute the metric.
        </>
    )
}

export const OpportunityTicketDrillDownInfoBar = ({
    totalTickets,
    isLoading,
    onDownload,
    isDownloading,
    isDownloadRequested,
    isDownloadError,
}: OpportunityTicketDrillDownInfoBarProps) => {
    const resultsPlaceholder = 'Fetching tickets...'
    const currentUser = useAppSelector(getCurrentUser)
    const { running } = useRunningJobs()

    const hasNoPermissions = !(
        hasRole(currentUser, UserRole.Admin) ||
        hasRole(currentUser, UserRole.Agent)
    )
    const isDisabled =
        hasNoPermissions || isLoading || isDownloading || running !== false

    const getButtonIcon = () => {
        if (isDownloadRequested && !isDownloadError) {
            return 'check'
        }
        return 'download'
    }

    const getButtonText = () => {
        if (isDownloading) {
            return DOWNLOAD_LOADING_LABEL
        }
        if (isDownloadRequested && !isDownloadError) {
            return DOWNLOAD_REQUESTED_LABEL
        }
        return 'Download All Tickets'
    }

    return (
        <div className={classNames(css.wrapper, localCss.wrapper)}>
            <div className={classNames(css.icon, localCss.iconWrapper)}>
                {isLoading ? (
                    <Loader size="14px" minHeight="14px" />
                ) : (
                    <i className="material-icons">info</i>
                )}
            </div>
            <div className={css.text}>
                {isLoading ? resultsPlaceholder : getInfoLabel(totalTickets)}
            </div>

            <Tooltip>
                <TooltipTrigger>
                    <Button
                        id={tooltipTargetID}
                        isDisabled={isDisabled}
                        variant="tertiary"
                        leadingSlot={getButtonIcon()}
                        className={
                            isDownloadRequested && !isDownloadError
                                ? localCss.successButton
                                : localCss.downloadButton
                        }
                        {...(!isDownloadRequested && {
                            onClick: onDownload,
                        })}
                    >
                        {getButtonText()}
                    </Button>
                </TooltipTrigger>
                <TooltipContent
                    title={
                        running !== false
                            ? OPERATION_IN_PROGRESS_CONTENT
                            : NO_PERMISSIONS_CONTENT
                    }
                />
            </Tooltip>
        </div>
    )
}
