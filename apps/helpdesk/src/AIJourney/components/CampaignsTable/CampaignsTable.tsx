import { useCallback, useState } from 'react'

import {
    Box,
    Button,
    ColumnDef,
    HeaderRowGroup,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    useTable,
} from '@gorgias/axiom'

import { JOURNEY_TYPES, STEPS_NAMES } from 'AIJourney/constants'

import EmptyCampaignsState from './EmptyCampaignsState/EmptyCampaignsState'
import RemoveCampaignConfirmation from './RemoveCampaignConfirmation/RemoveCampaignConfirmation'
import { CampaignsTableMeta } from './types'

import styles from './CampaignsTable.less'

type CampaignsTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
}

export default function CampaignsTable<TData, TValue>({
    columns,
    data,
    isLoading = false,
}: CampaignsTableProps<TData, TValue>) {
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
        null,
    )

    // TODO: Add delete campaign mutation
    // const { mutate: deleteCampaign } = useDeleteCampaign()

    const handleOpenRemoveModal = useCallback(
        (id: string) => {
            setSelectedCampaignId(id)
            setIsRemoveModalOpen(true)
        },
        [setSelectedCampaignId, setIsRemoveModalOpen],
    )

    const handleCloseRemoveModal = useCallback(() => {
        setIsRemoveModalOpen(false)
        setSelectedCampaignId(null)
    }, [setSelectedCampaignId, setIsRemoveModalOpen])

    const handleConfirmRemove = useCallback(() => {
        if (selectedCampaignId) {
            // deleteCampaign({ id: selectedCampaignId })
        }
        handleCloseRemoveModal()
    }, [selectedCampaignId, handleCloseRemoveModal])

    const table = useTable({
        data,
        columns,
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
                onRemoveClick: handleOpenRemoveModal,
            } as CampaignsTableMeta,
        },
    })
    return (
        <>
            <div className={styles.tableWrapper}>
                <TableToolbar<TData>
                    table={table}
                    left={['search']}
                    right={[
                        'totalCount',
                        {
                            key: 'create',
                            content: (
                                <Button
                                    as="a"
                                    href={`${JOURNEY_TYPES.CAMPAIGN}/${STEPS_NAMES.SETUP}`}
                                    target="_self"
                                >
                                    Create campaign
                                </Button>
                            ),
                        },
                    ]}
                />
                <TableRoot withBorder>
                    <TableHeader>
                        <HeaderRowGroup
                            headerGroups={table.getHeaderGroups()}
                        />
                    </TableHeader>

                    <TableBodyContent
                        isLoading={isLoading}
                        rows={table.getRowModel().rows}
                        columnCount={columns.length}
                        table={table}
                        renderEmptyStateComponent={() => (
                            <Box alignItems="center" justifyContent="center">
                                <EmptyCampaignsState />
                            </Box>
                        )}
                    />
                </TableRoot>
                <TableToolbar table={table} right={['pagination']} />
            </div>
            <RemoveCampaignConfirmation
                isOpen={isRemoveModalOpen}
                onClose={handleCloseRemoveModal}
                onConfirm={handleConfirmRemove}
            />
        </>
    )
}
