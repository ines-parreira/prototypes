import {
    Box,
    HeaderRowGroup,
    Size,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    useTable,
} from '@gorgias/axiom'

import type { Segment } from 'AIJourney/pages/Segments/Segments'

import { actionColumns, segmentColumns } from './SegmentsColumns'

type Props = {
    data: Segment[]
    isLoading?: boolean
    onSegmentClick: (segment: Segment) => void
    onEditClick: (segment: Segment) => void
    onDuplicateClick: (segment: Segment) => void
    onDeleteClick: (segment: Segment) => void
}

export const SegmentsTable = ({
    data,
    isLoading = false,
    onSegmentClick,
    onEditClick,
    onDuplicateClick,
    onDeleteClick,
}: Props) => {
    const table = useTable({
        data,
        columns: [...segmentColumns, ...actionColumns],
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: true,
        },
        paginationConfig: {
            enablePagination: true,
            manualPagination: false,
            pageSize: 10,
            initialPageIndex: 0,
        },
        globalFilterConfig: {
            enableGlobalFilter: true,
            globalFilterFn: 'includesString',
        },
        additionalOptions: {
            meta: {
                onSegmentClick,
                onEditClick,
                onDuplicateClick,
                onDeleteClick,
            },
        },
    })

    return (
        <>
            <Box paddingLeft={Size.Lg}>
                <TableToolbar<Segment>
                    table={table}
                    bottomRow={{
                        left: ['totalCount'],
                    }}
                    topRow={{ left: ['search'] }}
                />
            </Box>
            <TableRoot withBorder={false}>
                <TableHeader>
                    <HeaderRowGroup headerGroups={table.getHeaderGroups()} />
                </TableHeader>
                <TableBodyContent
                    isLoading={isLoading}
                    rows={table.getRowModel().rows}
                    columnCount={segmentColumns.length + actionColumns.length}
                    table={table}
                    renderEmptyStateComponent={() => (
                        <Box alignItems="center" justifyContent="center">
                            No segments found
                        </Box>
                    )}
                />
            </TableRoot>
            <Box flexDirection="row-reverse" padding={Size.Md}>
                <TableToolbar
                    table={table}
                    bottomRow={{ right: ['pagination'] }}
                />
            </Box>
        </>
    )
}
