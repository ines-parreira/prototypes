import {
    Box,
    HeaderRowGroup,
    IconName,
    TableBodyContent,
    TableHeader,
    TableRoot,
    Text,
    TextField,
} from '@gorgias/axiom'
import type { TicketsSearchListDataItem } from '@gorgias/helpdesk-types'

import type { useMergeTicketsTable } from './useMergeTicketsTable'
import { mergeTicketsTableColumns } from './useMergeTicketsTable'

type MergeTicketsModalSearchTabProps = {
    subject: string | null
    searchQuery: string
    setSearchQuery: (searchQuery: string) => void
    table: ReturnType<typeof useMergeTicketsTable>
    isFetching: boolean
    onRowClick: (row: TicketsSearchListDataItem) => void
}

export function MergeTicketsModalSearchTab({
    subject,
    searchQuery,
    setSearchQuery,
    table,
    isFetching,
    onRowClick,
}: MergeTicketsModalSearchTabProps) {
    return (
        <Box
            minHeight="420px"
            height="100%"
            width="100%"
            flexDirection="column"
            gap="md"
        >
            <Text>
                Select the ticket you want to merge{' '}
                <Text variant="bold">{subject}</Text> with in the table below:
            </Text>
            <TextField
                leadingSlot={IconName.SearchMagnifyingGlass}
                placeholder="Search for a ticket"
                value={searchQuery}
                onChange={setSearchQuery}
            />

            <TableRoot withBorder>
                <TableHeader>
                    <HeaderRowGroup headerGroups={table.getHeaderGroups()} />
                </TableHeader>
                <TableBodyContent
                    isLoading={isFetching}
                    skeletonRows={8}
                    table={table}
                    rows={table.getRowModel().rows}
                    columnCount={mergeTicketsTableColumns.length}
                    onRowClick={onRowClick}
                />
            </TableRoot>
        </Box>
    )
}
