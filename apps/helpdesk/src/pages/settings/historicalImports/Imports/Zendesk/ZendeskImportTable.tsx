import {
    HeaderRowGroup,
    TableBodyContent,
    TableHeader,
    TableRoot,
    useTable,
} from '@gorgias/axiom'
import { useListIntegrations } from '@gorgias/helpdesk-queries'

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
                staleTime: 60 * 60 * 1000,
                cacheTime: 60 * 60 * 1000,
                select: (resp) => resp?.data?.data,
            },
        },
    )

    const table = useTable({
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
        <TableRoot>
            <TableHeader>
                <HeaderRowGroup headerGroups={table.getHeaderGroups()} />
            </TableHeader>
            <TableBodyContent
                isLoading={isLoading}
                rows={table.getRowModel().rows}
                columnCount={columns.length}
                table={table}
            />
        </TableRoot>
    )
}
