import {
    Button,
    ButtonSize,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { UserRole } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import { useRunningJobs } from 'jobs'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

import css from './OpportunityTicketDrillDownInfoBar.less'

const DRILLDOWN_QUERY_LIMIT = 100
const DOWNLOAD_REQUESTED_LABEL = 'Download Requested'
const DOWNLOAD_LOADING_LABEL = 'Loading'
const NO_PERMISSIONS_CONTENT =
    "You don't have enough permissions to download this content."
const OPERATION_IN_PROGRESS_CONTENT =
    'A long-running job (e.g., ticket export, bulk action) is currently in progress on your account. Please wait until it is finished before requesting a new export.'

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
        return `Displaying last ${totalResults} ${totalResults === 1 ? 'ticket' : 'tickets'}`
    }
    return `Displaying last ${DRILLDOWN_QUERY_LIMIT} ${totalResults === 1 ? 'ticket' : 'tickets'}`
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

        return totalTickets > DRILLDOWN_QUERY_LIMIT
            ? 'Export all tickets'
            : 'Export'
    }

    return (
        <div className={css.wrapper}>
            <Text size="sm" variant="medium" className={css.text}>
                {isLoading ? resultsPlaceholder : getInfoLabel(totalTickets)}
            </Text>

            {isDisabled && (
                <Tooltip
                    trigger={
                        <Button
                            size={ButtonSize.Sm}
                            isDisabled={true}
                            variant="primary"
                            leadingSlot={getButtonIcon()}
                        >
                            {getButtonText()}
                        </Button>
                    }
                >
                    <TooltipContent
                        title={
                            running !== false
                                ? OPERATION_IN_PROGRESS_CONTENT
                                : NO_PERMISSIONS_CONTENT
                        }
                    />
                </Tooltip>
            )}
            {!isDisabled && (
                <Button
                    size={ButtonSize.Sm}
                    variant="primary"
                    leadingSlot={getButtonIcon()}
                    {...(!isDownloadRequested && {
                        onClick: onDownload,
                    })}
                >
                    {getButtonText()}
                </Button>
            )}
        </div>
    )
}
