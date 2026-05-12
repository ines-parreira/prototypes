import {
    Box,
    Pagination,
    TableHeader,
    TableV1BodyContent,
    TableV1HeaderRowGroup,
    TableV1Root,
    TableV1Toolbar,
    useTableV1,
} from '@gorgias/axiom'

import type { Segment } from 'AIJourney/pages/Segments/Segments'

import { actionColumns, segmentColumns } from './SegmentsColumns'

type Props = {
    data: Segment[]
    isLoading?: boolean
    hasNextPage: boolean
    hasPrevPage: boolean
    pageSize: number
    integrationId?: number | null
    canWrite: boolean
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
    integrationId,
    canWrite,
    onNextPage,
    onPrevPage,
    onPageSizeChange,
    onSegmentClick,
    onEditClick,
    onDuplicateClick,
    onDeleteClick,
}: Props) => {
    const table = useTableV1({
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
                integrationId,
                canWrite,
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
                <TableV1Toolbar<Segment>
                    table={table}
                    topRow={{ left: ['search'] }}
                />
            </Box>
            <TableV1Root withBorder={false}>
                <TableHeader>
                    <TableV1HeaderRowGroup
                        headerGroups={table.getHeaderGroups()}
                    />
                </TableHeader>
                <TableV1BodyContent
                    isLoading={isLoading}
                    rows={table.getRowModel().rows}
                    columnCount={segmentColumns.length + actionColumns.length}
                    table={table}
                    renderEmptyStateComponent={() => (
                        <Box justifyContent="center">
                            <span>No segments found</span>
                        </Box>
                    )}
                />
            </TableV1Root>
            <Box justifyContent="flex-end" paddingRight="md" paddingTop="xs">
                <TableV1Toolbar
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
