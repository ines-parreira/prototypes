import { useState } from 'react'

import {
    ColumnDef,
    HeaderRowGroup,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    useTable,
} from '@gorgias/axiom'

import { useDeleteMetafield } from '../hooks/useDeleteMetafield'
import { useToggleMetafieldVisibility } from '../hooks/useToggleMetafieldVisibility'
import RemoveMetafieldConfirmation from '../RemoveMetafieldConfirmation/RemoveMetafieldConfirmation'
import ImportAction from './ImportAction'
import { MetafieldsTableMeta } from './types'

import styles from './MetafieldsTable.less'

type MetafieldsTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
}

export default function MetafieldsTable<TData, TValue>({
    columns,
    data,
    isLoading = false,
}: MetafieldsTableProps<TData, TValue>) {
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
    const [selectedMetafieldId, setSelectedMetafieldId] = useState<
        string | null
    >(null)

    const { mutate: toggleVisibility } = useToggleMetafieldVisibility()
    const { mutate: deleteMetafield } = useDeleteMetafield()

    const handleOpenRemoveModal = (id: string) => {
        setSelectedMetafieldId(id)
        setIsRemoveModalOpen(true)
    }

    const handleCloseRemoveModal = () => {
        setIsRemoveModalOpen(false)
        setSelectedMetafieldId(null)
    }

    const handleConfirmRemove = () => {
        if (selectedMetafieldId) {
            deleteMetafield({ id: selectedMetafieldId })
        }
        handleCloseRemoveModal()
    }

    const handleVisibilityToggle = (id: string, isVisible: boolean) => {
        toggleVisibility({ id, isVisible: !isVisible })
    }

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
                onVisibilityToggle: handleVisibilityToggle,
            } as MetafieldsTableMeta,
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
                            key: 'import',
                            content: <ImportAction />,
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
                    />
                </TableRoot>
                <TableToolbar table={table} right={['pagination']} />
            </div>
            <RemoveMetafieldConfirmation
                isOpen={isRemoveModalOpen}
                onClose={handleCloseRemoveModal}
                onConfirm={handleConfirmRemove}
            />
        </>
    )
}
