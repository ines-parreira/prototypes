import cn from 'classnames'

import {
    LegacyBadge as Badge,
    LegacyLoadingSpinner as LoadingSpinner,
} from '@gorgias/axiom'

import gmailIcon from 'assets/img/integrations/gmail.svg'
import officeIcon from 'assets/img/integrations/office.svg'
import { IntegrationType } from 'models/integration/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import css from './ImportEmail.less'

const COLUMN_WIDTHS = {
    email: 160,
    importData: 180,
    status: 360,
}

export interface ImportEmailData {
    id: string
    email: string
    emailCount: number
    dateRange: string
    status: string
    progressPercentage: number
    provider: IntegrationType
}

interface TableImportEmailProps {
    data?: ImportEmailData[]
}

const getProviderIcon = (provider: IntegrationType) => {
    switch (provider) {
        case IntegrationType.Gmail:
            return (
                <img
                    alt="gmail logo"
                    src={gmailIcon}
                    className="EmailIntegrationList--logo--qlVh_"
                />
            )
        case IntegrationType.Outlook:
            return (
                <img
                    alt="outlook logo"
                    src={officeIcon}
                    className="EmailIntegrationList--logo--qlVh_"
                />
            )
        default:
            return <i className="material-icons">email</i>
    }
}

const getStatusBadge = (status: string, progressPercentage: number) => {
    switch (status) {
        case 'completed':
            return (
                <Badge type="light-success">
                    <span className={cn(css.icon, css.successIcon)}>✓</span>
                    COMPLETED
                </Badge>
            )
        case 'failed':
            return (
                <Badge type="light-dark">
                    <span className={cn(css.icon, css.errorIcon)}>✗</span>
                    FAILED
                </Badge>
            )
        case 'in_progress':
            return (
                <Badge type="light-warning">
                    <span className={cn(css.icon)}>
                        <LoadingSpinner size="small" className={css.spinner} />
                    </span>
                    {progressPercentage}% COMPLETED
                </Badge>
            )
        default:
            return <Badge type="light-dark">UNKNOWN</Badge>
    }
}

const TableImportEmail = ({ data = [] }: TableImportEmailProps) => {
    const isFetching = false

    return (
        <TableWrapper>
            <TableHead>
                <HeaderCellProperty
                    title="Email"
                    width={COLUMN_WIDTHS.email}
                    className={css.headerCell}
                />
                <HeaderCellProperty
                    title="Import data"
                    width={COLUMN_WIDTHS.importData}
                    className={css.headerCell}
                />
                <HeaderCellProperty
                    title="Status"
                    width={COLUMN_WIDTHS.status}
                    className={css.headerCell}
                />
            </TableHead>
            <TableBody>
                {isFetching ? (
                    <div>Loading...</div>
                ) : (
                    data.map((importItem) => (
                        <TableBodyRow key={importItem.id}>
                            <BodyCell width={COLUMN_WIDTHS.email}>
                                {getProviderIcon(importItem.provider)}
                                <span className="ml-4">{importItem.email}</span>
                            </BodyCell>
                            <BodyCell width={COLUMN_WIDTHS.importData}>
                                <div className={css.importStats}>
                                    <span>
                                        {importItem.emailCount.toLocaleString()}{' '}
                                        emails
                                    </span>
                                    <p>{importItem.dateRange}</p>
                                </div>
                            </BodyCell>
                            <BodyCell width={COLUMN_WIDTHS.status}>
                                {getStatusBadge(
                                    importItem.status,
                                    importItem.progressPercentage,
                                )}
                            </BodyCell>
                        </TableBodyRow>
                    ))
                )}
            </TableBody>
        </TableWrapper>
    )
}

export default TableImportEmail
