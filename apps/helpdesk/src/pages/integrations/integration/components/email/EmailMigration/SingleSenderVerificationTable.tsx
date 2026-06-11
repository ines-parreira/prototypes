import type { EmailMigrationSenderVerificationIntegration } from 'models/integration/types'
import { Pagination } from 'pages/common/components/Pagination'
import { HeaderCell } from 'pages/common/components/table/cells/HeaderCell'
import { HeaderCellProperty } from 'pages/common/components/table/cells/HeaderCellProperty'
import { DefaultExportTableBody as TableBody } from 'pages/common/components/table/TableBody'
import { DefaultExportTableBodyRow as TableBodyRow } from 'pages/common/components/table/TableBodyRow'
import { TableHead } from 'pages/common/components/table/TableHead'
import { TableWrapper } from 'pages/common/components/table/TableWrapper'
import { useClientSidePagination } from 'pages/common/hooks/useClientSidePagination'

import { SingleSenderVerificationTableRow } from './SingleSenderVerificationTableRow'

import css from './SingleSenderVerificationTable.less'

export type Props = {
    integrations: EmailMigrationSenderVerificationIntegration[]
    hasSubmittedBulkVerification: boolean
    refreshMigrationData: () => void
}

export function SingleSenderVerificationTable({
    integrations,
    hasSubmittedBulkVerification,
    refreshMigrationData,
}: Props) {
    const { paginatedItems, ...pagination } = useClientSidePagination({
        items: integrations,
        itemsPerPage: 5,
    })

    return (
        <>
            <TableWrapper className={css.tableWrapper}>
                <TableHead>
                    <HeaderCellProperty title="Unverified emails" />
                    <HeaderCell />
                </TableHead>
                <TableBody>
                    {paginatedItems.map((integration) => (
                        <TableBodyRow key={integration.id}>
                            <SingleSenderVerificationTableRow
                                integration={integration}
                                hasSubmittedBulkVerification={
                                    hasSubmittedBulkVerification
                                }
                                refreshMigrationData={refreshMigrationData}
                            />
                        </TableBodyRow>
                    ))}
                </TableBody>
            </TableWrapper>
            <Pagination {...pagination} />
        </>
    )
}
