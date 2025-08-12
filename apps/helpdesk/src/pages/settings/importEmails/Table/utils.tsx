import { Badge, LoadingSpinner } from '@gorgias/axiom'
import { ImportProvider, ImportStatus } from '@gorgias/helpdesk-types'

import gmailIcon from 'assets/img/integrations/gmail.svg'
import officeIcon from 'assets/img/integrations/office.svg'

import css from '../ImportEmail.less'

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })

export const getDateRange = (
    import_window_start: string,
    import_window_end: string,
) => {
    return `${formatDate(import_window_start)} – ${formatDate(import_window_end)}`
}

export const getProviderIcon = (provider: ImportProvider) => {
    switch (provider) {
        case ImportProvider.Gmail:
            return (
                <img
                    alt="gmail logo"
                    src={gmailIcon}
                    className={css.providerIcon}
                />
            )
        case ImportProvider.Outlook:
            return (
                <img
                    alt="outlook logo"
                    src={officeIcon}
                    className={css.providerIcon}
                />
            )
        default:
            return <i className="material-icons">email</i>
    }
}

export const getStatusBadge = (
    status: ImportStatus,
    progressPercentage: number,
) => {
    switch (status) {
        case 'completed':
            return (
                <Badge type="light-success">
                    <span className="material-icons-outlined">
                        check_circle_outline
                    </span>
                    COMPLETED
                </Badge>
            )
        case 'failed':
            return (
                <Badge type="light-error">
                    <span className="material-icons-outlined">
                        error_outline
                    </span>
                    FAILED
                </Badge>
            )
        case 'in-progress':
            return (
                <Badge type="light-warning">
                    <LoadingSpinner size="small" className={css.spinner} />
                    {progressPercentage}% COMPLETED
                </Badge>
            )
        default:
            return <Badge type="light-dark">UNKNOWN</Badge>
    }
}
