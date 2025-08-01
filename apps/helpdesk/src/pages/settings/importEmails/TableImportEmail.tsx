import cn from 'classnames'

import { Badge, LoadingSpinner } from '@gorgias/merchant-ui-kit'

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

const MOCK_IMPORT_DATA = [
    {
        id: '1',
        email: 'info@betseyjohnson.com',
        emailCount: 333,
        dateRange: 'Jan 1, 2025 – Jan 25, 2025',
        status: 'in_progress',
        progressPercentage: 50,
        provider: IntegrationType.Gmail,
    },
    {
        id: '2',
        email: 'infoUSA@betseyjohnson.com',
        emailCount: 11333,
        dateRange: 'Dec 7, 2024 – Feb 7, 2025',
        status: 'in_progress',
        progressPercentage: 75,
        provider: IntegrationType.Gmail,
    },
    {
        id: '3',
        email: 'info@dolcevita.com',
        emailCount: 567,
        dateRange: 'May 1, 2025 – May 31, 2025',
        status: 'failed',
        progressPercentage: 0,
        provider: IntegrationType.Gmail,
    },
    {
        id: '4',
        email: 'info@dolcevita.ca',
        emailCount: 102,
        dateRange: 'June 7, 2025 – June 30, 2025',
        status: 'completed',
        progressPercentage: 100,
        provider: IntegrationType.Outlook,
    },
    {
        id: '5',
        email: 'info@dolcevita.mx',
        emailCount: 30,
        dateRange: 'June 4, 2024 – June 7, 2025',
        status: 'completed',
        progressPercentage: 100,
        provider: IntegrationType.Gmail,
    },
    {
        id: '6',
        email: 'info@stevemadden.fr',
        emailCount: 11333,
        dateRange: 'Dec 8, 2024 – June 7, 2025',
        status: 'completed',
        progressPercentage: 100,
        provider: IntegrationType.Outlook,
    },
]

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

const TableImportEmail = () => {
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
                    MOCK_IMPORT_DATA.map((importItem) => (
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
