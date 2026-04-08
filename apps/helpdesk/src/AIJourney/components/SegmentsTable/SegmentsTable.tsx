import {
    Box,
    HeaderRowGroup,
    Pagination,
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
    hasNextPage: boolean
    hasPrevPage: boolean
    pageSize: number
    onNextPage: () => void
    onPrevPage: () => void
    onPageSizeChange: (size: number) => void
    onSegmentClick: (segment: Segment) => void
    onEditClick: (segment: Segment) => void
    onDuplicateClick: (segment: Segment) => void
    onDeleteClick: (segment: Segment) => void
}

export const SegmentsTable = ({
    data,
    isLoading = false,
    hasNextPage,
    hasPrevPage,
    pageSize,
    onNextPage,
    onPrevPage,
    onPageSizeChange,
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
            enablePagination: false,
            manualPagination: true,
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
            <Box paddingLeft="lg">
                <TableToolbar<Segment>
                    table={table}
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
                        <span>No segments found</span>
                    )}
                />
            </TableRoot>
            <Box justifyContent="flex-end" paddingRight="md" paddingTop="xs">
                <TableToolbar
                    table={table}
                    bottomRow={{
                        right: [
                            {
                                key: 'pagination',
                                content: (
                                    <Pagination
                                        hasNextPage={hasNextPage}
                                        hasPreviousPage={hasPrevPage}
                                        defaultItemsPerPage={pageSize}
                                        onPageChange={(dir) =>
                                            dir === 'next'
                                                ? onNextPage()
                                                : onPrevPage()
                                        }
                                        onItemsPerPageChange={onPageSizeChange}
                                    />
                                ),
                            },
                        ],
                    }}
                />
            </Box>
        </>
    )
}
