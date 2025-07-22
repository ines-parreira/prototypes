import { useState } from 'react'

import { noop } from 'lodash'

import { useListIntegrationsForBusinessHours } from '@gorgias/helpdesk-queries'
import { CheckBoxField, Skeleton } from '@gorgias/merchant-ui-kit'

import { FormField, useFormContext } from 'core/forms'
import Navigation from 'pages/common/components/Navigation/Navigation'
import SectionHeader from 'pages/common/components/SectionHeader/SectionHeader'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import IntegrationRowsField from './IntegrationRowsField'
import { EditCustomBusinessHoursFormValues } from './types'

import css from './CustomBusinessHoursIntegrationsTable.less'

export default function CustomBusinessHoursIntegrationsTable() {
    const [cursor, setCursor] = useState<string>()
    const { data, isLoading, isError, refetch } =
        useListIntegrationsForBusinessHours({ cursor })
    const integrations = data?.data.data

    const { watch, setValue } =
        useFormContext<EditCustomBusinessHoursFormValues>()

    const assignIntegrations = watch(
        'assigned_integrations.assign_integrations',
    )
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

        setValue(
            'assigned_integrations.assign_integrations',
            Array.from(newAssignIntegrationsSet),
        )
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

    return (
        <div>
            <SectionHeader
                title="Integrations"
                description="Assign one or multiple integrations for your custom business hours."
            />
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
                    <HeaderCell
                        size="normal"
                        className={css.integrationNameColumn}
                    >
                        Integration
                    </HeaderCell>
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
                            name="assigned_integrations.assign_integrations"
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
            <BodyCell />
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
