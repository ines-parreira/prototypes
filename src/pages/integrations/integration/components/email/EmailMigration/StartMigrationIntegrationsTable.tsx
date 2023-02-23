import React from 'react'
import {fromJS} from 'immutable'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import Pagination from 'pages/common/components/Pagination'
import useClientSidePagination from 'pages/common/hooks/useClientSidePagination'
import useAppSelector from 'hooks/useAppSelector'
import {
    getAreIntegrationsLoading,
    getIntegrationsByTypes,
} from 'state/integrations/selectors'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import {EmailIntegration} from 'models/integration/types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import useAppDispatch from 'hooks/useAppDispatch'
import {deleteIntegration} from 'state/integrations/actions'
import Loader from 'pages/common/components/Loader/Loader'
import {isBaseEmailIntegration} from '../helpers'

import css from './StartMigrationIntegrationsTable.less'

export default function StartMigrationIntegrationsTable() {
    const isLoading = useAppSelector(getAreIntegrationsLoading)
    const allEmailIntegrations = useAppSelector(
        getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)
    ) as EmailIntegration[]

    const displayedIntegrations = allEmailIntegrations.filter(
        (integration) => !isBaseEmailIntegration(integration)
    )

    const {page, pageCount, paginatedItems, onPageChange} =
        useClientSidePagination({
            items: displayedIntegrations,
            itemsPerPage: 5,
        })

    const dispatch = useAppDispatch()

    if (isLoading) return <Loader />

    return (
        <div className={css.container}>
            <TableWrapper className={css.table}>
                <TableHead>
                    <HeaderCellProperty title="Email" />
                </TableHead>
                <TableBody>
                    {paginatedItems.map((integration) => (
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
                                                fromJS(integration)
                                            )
                                        )
                                    }
                                    data-testid="delete-button"
                                >
                                    <ButtonIconLabel icon="delete" />
                                </ConfirmButton>
                            </BodyCell>
                        </TableBodyRow>
                    ))}
                </TableBody>
            </TableWrapper>
            <Pagination
                pageCount={pageCount}
                onChange={onPageChange}
                currentPage={page}
            />
        </div>
    )
}
