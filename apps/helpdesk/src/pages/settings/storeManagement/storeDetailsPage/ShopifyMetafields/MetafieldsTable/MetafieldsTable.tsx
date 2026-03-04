import { useState } from 'react'

import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    Filters,
    HeaderRowGroup,
    ListItem,
    SelectFilter,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    useTable,
} from '@gorgias/axiom'

import {
    DEFAULT_TABLE_PAGE_SIZE,
    METAFIELD_CATEGORIES,
    METAFIELD_TYPE_OPTIONS,
} from '../constants'
import EmptyMetafieldsState from '../EmptyMetafieldsState'
import { useDeleteMetafield } from '../hooks/useDeleteMetafield'
import { useMetafieldsFiltersHandler } from '../hooks/useMetafieldsFiltersHandler'
import { useToggleMetafieldVisibility } from '../hooks/useToggleMetafieldVisibility'
import ImportMetafieldFlow from '../ImportMetafieldFlow/ImportMetafieldFlow'
import RemoveMetafieldConfirmation from '../RemoveMetafieldConfirmation/RemoveMetafieldConfirmation'
import ImportAction from './ImportAction'
import type { Field, MetafieldsTableMeta } from './types'

import styles from './MetafieldsTable.less'

const categoryOptions = METAFIELD_CATEGORIES.map((cat) => ({
    id: cat.value,
    category: cat.value,
    label: cat.label,
}))

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
    const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false)

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

    const handleOpenCategoriesModal = () => {
        setIsCategoriesModalOpen(true)
    }

    const handleCloseCategoriesModal = () => {
        setIsCategoriesModalOpen(false)
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
            pageSize: DEFAULT_TABLE_PAGE_SIZE,
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

    const handleFiltersChange = useMetafieldsFiltersHandler({
        table,
        filterColumns: ['type', 'category'],
    })

    return (
        <>
            <div className={styles.tableWrapper}>
                <div className={styles.topToolbarWrapper}>
                    <TableToolbar<TData>
                        table={table}
                        bottomRow={{
                            left: [
                                'search',
                                {
                                    key: 'filters',
                                    content: (
                                        <div>
                                            <Filters
                                                onChange={handleFiltersChange}
                                            >
                                                <SelectFilter
                                                    id="type"
                                                    label="Type"
                                                    items={
                                                        METAFIELD_TYPE_OPTIONS
                                                    }
                                                    keyName="id"
                                                >
                                                    {(option) => (
                                                        <ListItem
                                                            label={option.label}
                                                        />
                                                    )}
                                                </SelectFilter>
                                                <SelectFilter
                                                    id="category"
                                                    label="Category"
                                                    items={categoryOptions}
                                                    keyName="id"
                                                >
                                                    {(option) => (
                                                        <ListItem
                                                            label={option.label}
                                                        />
                                                    )}
                                                </SelectFilter>
                                            </Filters>
                                        </div>
                                    ),
                                },
                            ],
                            right: [
                                'totalCount',
                                {
                                    key: 'import',
                                    content: (
                                        <ImportAction
                                            onImportClick={
                                                handleOpenCategoriesModal
                                            }
                                        />
                                    ),
                                },
                            ],
                        }}
                    />
                </div>
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
                            <Box
                                alignItems="center"
                                justifyContent="center"
                                width="100%"
                            >
                                <EmptyMetafieldsState
                                    handleOpenCategoriesModal={
                                        handleOpenCategoriesModal
                                    }
                                />
                            </Box>
                        )}
                    />
                </TableRoot>
                <div className={styles.toolbarWrapper}>
                    <TableToolbar
                        table={table}
                        bottomRow={{ right: ['pagination'] }}
                    />
                </div>
            </div>
            <RemoveMetafieldConfirmation
                isOpen={isRemoveModalOpen}
                onClose={handleCloseRemoveModal}
                onConfirm={handleConfirmRemove}
            />
            <ImportMetafieldFlow
                isOpen={isCategoriesModalOpen}
                onClose={handleCloseCategoriesModal}
                importedFields={data as Field[]}
            />
        </>
    )
}
