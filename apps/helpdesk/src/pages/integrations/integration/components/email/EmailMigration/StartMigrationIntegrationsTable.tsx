import { fromJS } from 'immutable'

import { LegacyBadge as Badge } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import type { EmailIntegration } from 'models/integration/types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Pagination from 'pages/common/components/Pagination'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import useClientSidePagination from 'pages/common/hooks/useClientSidePagination'
import { deleteIntegration } from 'state/integrations/actions'

import EmptyMigrationTableRow from './EmptyMigrationTableRow'

import css from './StartMigrationIntegrationsTable.less'

type Props = {
    integrations: EmailIntegration[]
}

export default function StartMigrationIntegrationsTable({
    integrations,
}: Props) {
    const { paginatedItems, ...pagination } = useClientSidePagination({
        items: integrations,
        itemsPerPage: 5,
    })

    const dispatch = useAppDispatch()

    const hasIntegrationsToMigrate = !!integrations.length

    return (
        <div className={css.container}>
            <div className={css.tableAndHeading}>
                <div className={css.subtitle}>
                    <h2>Migration status</h2>
                    {hasIntegrationsToMigrate && (
                        <Badge type={'light-warning'}>
                            0/{integrations.length} emails migrated
                        </Badge>
                    )}
                </div>
                <TableWrapper className={css.table}>
                    <TableHead>
                        <HeaderCellProperty title="Email" />
                    </TableHead>
                    <TableBody>
                        {hasIntegrationsToMigrate ? (
                            paginatedItems.map((integration) => (
                                <TableBodyRow key={integration.id}>
                                    <BodyCell className={css.address}>
                                        {integration.meta.address}
                                    </BodyCell>
                                    <BodyCell>
                                        <ConfirmButton
                                            confirmationTitle="Delete email integration?"
                                            confirmationContent="By deleting the integration, you will no longer be able to send or receive messages from this email address."
                                            confirmLabel="Delete integration"
                                            confirmationButtonIntent="destructive"
                                            showCancelButton
                                            fillStyle="ghost"
                                            intent="destructive"
                                            className={css.deleteButton}
                                            onConfirm={() =>
                                                dispatch(
                                                    deleteIntegration(
                                                        fromJS(integration),
                                                    ),
                                                )
                                            }
                                            data-testid="delete-button"
                                        >
                                            <ButtonIconLabel icon="delete" />
                                        </ConfirmButton>
                                    </BodyCell>
                                </TableBodyRow>
                            ))
                        ) : (
                            <EmptyMigrationTableRow>
                                All set! You have no email integrations to be
                                migrated.
                            </EmptyMigrationTableRow>
                        )}
                    </TableBody>
                </TableWrapper>
            </div>
            <Pagination {...pagination} />
        </div>
    )
}
