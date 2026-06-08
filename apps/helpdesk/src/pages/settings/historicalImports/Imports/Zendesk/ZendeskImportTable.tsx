import {
    TableHeader,
    TableV1BodyContent,
    TableV1HeaderRowGroup,
    TableV1Root,
    useTableV1,
} from '@gorgias/axiom'
import { useListIntegrations } from '@gorgias/helpdesk-queries'
import { Duration } from '@gorgias/toolkit'

import { EmptyState } from '../EmptyState'
import { columns } from './columns'

type ZendeskImportTableProps = {
    onOpenCreateImportModal: () => void
}
export const ZendeskImportTable = ({
    onOpenCreateImportModal,
}: ZendeskImportTableProps) => {
    const { data: zendeskIntegrations, isLoading } = useListIntegrations(
        {
            type: 'zendesk',
        },
        {
            query: {
                staleTime: Duration.hours(1),
                cacheTime: Duration.hours(1),
                select: (resp) => resp?.data?.data,
            },
        },
    )

    const table = useTableV1({
        data: zendeskIntegrations ?? [],
        columns,
        sortingConfig: {
            enableSorting: false,
            enableMultiSort: false,
        },
    })

    if (
        !isLoading &&
        (!zendeskIntegrations || zendeskIntegrations.length < 1)
    ) {
        return (
            <EmptyState
                title="No Zendesk data imported"
                description="Connect to Zendesk to migrate up to 2 years of data. Once the initial import is complete, your Zendesk data will automatically stay in sync with Gorgias."
                ctaButtonCallback={onOpenCreateImportModal}
                ctaButtonLabel="Import Zendesk"
            />
        )
    }

    return (
        <TableV1Root>
            <TableHeader>
                <TableV1HeaderRowGroup headerGroups={table.getHeaderGroups()} />
            </TableHeader>
            <TableV1BodyContent
                isLoading={isLoading}
                rows={table.getRowModel().rows}
                columnCount={columns.length}
                table={table}
            />
        </TableV1Root>
    )
}
