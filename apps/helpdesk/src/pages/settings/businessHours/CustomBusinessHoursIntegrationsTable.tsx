import { useMemo, useState } from 'react'

import { noop } from 'lodash'

import {
    ListIntegrationsForBusinessHoursOrderBy,
    useListIntegrationsForBusinessHours,
} from '@gorgias/helpdesk-queries'
import { CheckBoxField, Skeleton } from '@gorgias/merchant-ui-kit'

import { FormField, useFormContext } from 'core/forms'
import { OrderDirection } from 'models/api/types'
import Navigation from 'pages/common/components/Navigation/Navigation'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import IntegrationRowsField from './IntegrationRowsField'
import {
    BusinessHoursCreateFormValues,
    EditCustomBusinessHoursFormValues,
} from './types'

import css from './CustomBusinessHoursIntegrationsTable.less'

type Props = {
    name?:
        | 'temporary_assigned_integrations'
        | 'assigned_integrations.assign_integrations'
}

export default function CustomBusinessHoursIntegrationsTable({
    name = 'assigned_integrations.assign_integrations',
}: Props) {
    const [cursor, setCursor] = useState<string>()
    const [order_by, setOrderBy] =
        useState<ListIntegrationsForBusinessHoursOrderBy>()
    const direction = useMemo(() => order_by?.split(':')?.[1], [order_by])
    const sortBy = useMemo(() => order_by?.split(':')?.[0], [order_by])

    const { data, isLoading, isError, refetch } =
        useListIntegrationsForBusinessHours({
            order_by,
            ...(order_by ? {} : { cursor }),
        })
    const integrations = data?.data.data

    const { watch, setValue } = useFormContext<
        BusinessHoursCreateFormValues | EditCustomBusinessHoursFormValues
    >()

    const assignIntegrations = watch(name)
    const isAllSelected = !!integrations?.every((integration) =>
        assignIntegrations.includes(integration.integration_id),
    )

    const handleSelectAll = (value: boolean) => {
        const newAssignIntegrationsSet = new Set(assignIntegrations)

        integrations?.forEach((integration) => {
            if (value) {
                newAssignIntegrationsSet.add(integration.integration_id)
            } else {
                newAssignIntegrationsSet.delete(integration.integration_id)
            }
        })

        setValue(name, Array.from(newAssignIntegrationsSet))
    }

    const updateCursor = (direction: 'next' | 'prev') => {
        if (direction === 'next') {
            !!data?.data.meta.next_cursor &&
                setCursor(data.data.meta.next_cursor)
        } else {
            !!data?.data.meta.prev_cursor &&
                setCursor(data.data.meta.prev_cursor)
        }
    }

    const handleSortChange = () => {
        if (!order_by) {
            setOrderBy('name:asc')
        } else if (order_by === 'name:asc') {
            setOrderBy('name:desc')
        } else {
            setOrderBy(undefined)
        }
    }

    return (
        <div>
            <TableWrapper className={css.table}>
                <TableHead>
                    <HeaderCell size="smallest">
                        <CheckBoxField
                            value={isAllSelected}
                            aria-label="Select all integrations"
                            isDisabled={isLoading}
                            onChange={handleSelectAll}
                        />
                    </HeaderCell>
                    <HeaderCellProperty
                        className={css.integrationNameColumn}
                        direction={direction as OrderDirection}
                        isOrderedBy={sortBy === 'name'}
                        onClick={handleSortChange}
                        title="Integration"
                    />
                    <HeaderCell size="normal" className={css.storeNameColumn}>
                        Store
                    </HeaderCell>
                    <HeaderCell
                        size="normal"
                        className={css.businessHoursColumn}
                    >
                        Business hours
                    </HeaderCell>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        <RowSkeleton />
                    ) : (
                        <FormField
                            name={name}
                            field={IntegrationRowsField}
                            onItemClick={noop}
                            integrations={integrations}
                            isError={isError}
                            refetch={refetch}
                        />
                    )}
                </TableBody>
                {!isLoading && (
                    <Navigation
                        className={css.pagination}
                        hasNextItems={!!data?.data.meta.next_cursor}
                        hasPrevItems={!!data?.data.meta.prev_cursor}
                        fetchNextItems={() => updateCursor('next')}
                        fetchPrevItems={() => updateCursor('prev')}
                    />
                )}
            </TableWrapper>
        </div>
    )
}

const RowSkeleton = () => {
    return (
        <TableBodyRow>
            <BodyCell>
                <CheckBoxField isDisabled value={false} />
            </BodyCell>
            <BodyCell className={css.integrationNameColumn}>
                <Skeleton width={208} />
            </BodyCell>
            <BodyCell className={css.storeNameColumn}>
                <Skeleton width={208} />
            </BodyCell>
            <BodyCell className={css.businessHoursColumn}>
                <Skeleton width={288} />
            </BodyCell>
        </TableBodyRow>
    )
}
