import React from 'react'
import classNames from 'classnames'
import {EmailMigrationInboundVerification} from 'models/integration/types'
import useClientSidePagination from 'pages/common/hooks/useClientSidePagination'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import Pagination from 'pages/common/components/Pagination'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import EmailVerificationStatusLabel, {
    EmailVerificationStatus,
} from '../EmailVerificationStatusLabel'
import {computeMigrationInboundVerificationStatus} from './utils'
import EmailForwardingButton from './EmailForwardingButton'
import EmptyMigrationTableRow from './EmptyMigrationTableRow'

import css from './EmailForwardingTable.less'

type Props = {
    migrations: EmailMigrationInboundVerification[]
}

export default function EmailForwardingTable({migrations}: Props) {
    const {paginatedItems, ...pagination} = useClientSidePagination({
        items: migrations,
        itemsPerPage: 5,
    })

    return (
        <div className={css.container}>
            <TableWrapper className={css.table}>
                <TableHead>
                    <HeaderCellProperty title="Email" />
                    <HeaderCellProperty title="Forwarding status" />
                    <HeaderCell className={css.ctaHeader} />
                </TableHead>
                <TableBody>
                    {paginatedItems.length ? (
                        paginatedItems.map((migration) => {
                            const verificationStatus =
                                computeMigrationInboundVerificationStatus(
                                    migration
                                )

                            return (
                                <TableBodyRow
                                    key={migration.integration.id}
                                    data-testid="migration-row"
                                >
                                    <BodyCell
                                        innerClassName={classNames(
                                            css.address,
                                            {
                                                [css.failed]:
                                                    verificationStatus ===
                                                    EmailVerificationStatus.Failed,
                                            }
                                        )}
                                        data-testid="email-address-value"
                                    >
                                        {migration.integration.meta.address}
                                    </BodyCell>
                                    <BodyCell>
                                        <EmailVerificationStatusLabel
                                            status={verificationStatus}
                                        />
                                    </BodyCell>
                                    <BodyCell innerClassName={css.cta}>
                                        <EmailForwardingButton
                                            migration={migration}
                                        />
                                    </BodyCell>
                                </TableBodyRow>
                            )
                        })
                    ) : (
                        <EmptyMigrationTableRow>
                            All set! You don't have any email forwarding to set
                            up.
                        </EmptyMigrationTableRow>
                    )}
                </TableBody>
            </TableWrapper>
            <Pagination {...pagination} />
        </div>
    )
}
