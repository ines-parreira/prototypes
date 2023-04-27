import React from 'react'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import {EmailMigrationSenderVerificationIntegration} from 'models/integration/types'
import useClientSidePagination from 'pages/common/hooks/useClientSidePagination'
import Pagination from 'pages/common/components/Pagination'
import SingleSenderVerificationTableRow from './SingleSenderVerificationTableRow'

export type Props = {
    integrations: EmailMigrationSenderVerificationIntegration[]
    hasSubmittedBulkVerification: boolean
    refreshMigrationData: () => void
}

export default function SingleSenderVerificationTable({
    integrations,
    hasSubmittedBulkVerification,
    refreshMigrationData,
}: Props) {
    const {paginatedItems, ...pagination} = useClientSidePagination({
        items: integrations,
        itemsPerPage: 5,
    })

    return (
        <>
            <TableWrapper>
                <TableHead>
                    <HeaderCellProperty title="Unverified emails" />
                    <HeaderCell />
                </TableHead>
                <TableBody>
                    {paginatedItems.map((integration) => (
                        <TableBodyRow
                            key={integration.id}
                            data-testid="sender-verification-row"
                        >
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
