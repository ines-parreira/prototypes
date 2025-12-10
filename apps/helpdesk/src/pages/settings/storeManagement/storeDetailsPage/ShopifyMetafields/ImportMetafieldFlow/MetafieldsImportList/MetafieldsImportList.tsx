import { useMemo } from 'react'

import cn from 'classnames'

import type { RowSelectionState } from '@gorgias/axiom'
import {
    Box,
    Button,
    Filters,
    HeaderRowGroup,
    Heading,
    ListItem,
    SelectFilter,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    Text,
    useTable,
} from '@gorgias/axiom'

import { MAX_FIELDS_PER_CATEGORY } from '../../constants'
import { useMetafieldsFiltersHandler } from '../../hooks/useMetafieldsFiltersHandler'
import type { Field } from '../../MetafieldsTable/types'
import { MetafieldEnum } from '../../MetafieldTypeItem/MetafieldTypeItem'
import type { MetafieldCategory } from '../../types'
import { getCategoryLabel } from '../../utils/getCategoryLabel'
import { getMetafieldTypeLabel } from '../../utils/getMetafieldTypeLabel'
import { isSupportedMetafieldType } from '../../utils/isSupportedMetafieldType'
import { useFilteredMetafields } from '../hooks/useFilteredMetafields'
import MaxFieldsImportedBanner from '../MaxMetafieldsImportedBanner/MaxFieldsImportedBanner'
import { getColumns } from './Columns'
import { mockImportableFields } from './data'

import styles from './MetafieldsImportList.less'

type MetafieldsImportListProps = {
    category: MetafieldCategory
    selectedMetafields: Field[]
    onSelectionChange: (selectedFields: Field[]) => void
    onBack: () => void
    onContinue: () => void
    isAtMaxFields?: boolean
    importedFields?: Field[]
}

const metafieldTypeOptions = Object.values(MetafieldEnum).map((type) => ({
    id: type,
    type,
    label: getMetafieldTypeLabel(type),
}))

export default function MetafieldsImportList({
    category,
    selectedMetafields,
    onSelectionChange,
    onBack,
    onContinue,
    isAtMaxFields,
    importedFields = [],
}: MetafieldsImportListProps) {
    const filteredData = useFilteredMetafields({
        data: mockImportableFields,
        category,
    })

    const importedFieldsForCategory = useMemo(
        () => importedFields.filter((field) => field.category === category),
        [importedFields, category],
    )

    const totalSelectedCount = useMemo(
        () => importedFieldsForCategory.length + selectedMetafields.length,
        [importedFieldsForCategory, selectedMetafields],
    )

    const hasReachedLimit = useMemo(
        () => totalSelectedCount >= MAX_FIELDS_PER_CATEGORY,
        [totalSelectedCount],
    )

    const initialRowSelection = useMemo(() => {
        return selectedMetafields.reduce((acc, field) => {
            acc[field.id] = true
            return acc
        }, {} as RowSelectionState)
    }, [selectedMetafields])

    const handleRowSelectionChange = (newSelection: RowSelectionState) => {
        const selectedIds = Object.keys(newSelection).filter(
            (id) => newSelection[id],
        )

        // Get selected fields in the order they appear in the table
        const selectedFieldsInOrder = filteredData.filter((field) =>
            selectedIds.includes(field.id),
        )

        // Enforce limit: if selecting more than available, take only first N
        const limitedSelectedFields = selectedFieldsInOrder.slice(
            0,
            MAX_FIELDS_PER_CATEGORY - importedFieldsForCategory.length,
        )

        onSelectionChange(limitedSelectedFields)
    }

    const columns = useMemo(
        () => getColumns(selectedMetafields, totalSelectedCount),
        [selectedMetafields, totalSelectedCount],
    )

    const table = useTable({
        data: filteredData,
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
        selectionConfig: {
            enableRowSelection: (row) => {
                if (!isSupportedMetafieldType(row.original.type)) {
                    return false
                }

                const isCurrentlySelected = selectedMetafields.some(
                    (field) => field.id === row.original.id,
                )

                if (isCurrentlySelected) {
                    return true
                }

                return !hasReachedLimit
            },
            initialRowSelection,
            onRowSelectionChange: handleRowSelectionChange,
        },
        additionalOptions: {
            getRowId: (row) => row.id,
        },
    })

    const handleFiltersChange = useMetafieldsFiltersHandler({
        table,
        filterColumns: ['type'],
    })

    return (
        <div>
            <Heading>{getCategoryLabel(category)}</Heading>
            <Box
                flexDirection="column"
                gap="md"
                marginBottom="md"
                marginTop="xxxs"
            >
                <Text>Choose up to 10 metafields to import to Gorgias.</Text>

                {isAtMaxFields ? <MaxFieldsImportedBanner /> : null}
            </Box>
            <div
                className={cn(styles.toolbarContainer, {
                    [styles.maxFieldsImported]: !!isAtMaxFields,
                })}
            >
                <TableToolbar
                    table={table}
                    bottomRow={{
                        left: [
                            'search',
                            {
                                key: 'filters',
                                content: (
                                    <div>
                                        <Filters onChange={handleFiltersChange}>
                                            <SelectFilter
                                                id="type"
                                                label="Type"
                                                items={metafieldTypeOptions}
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
                        right: ['selectCount'],
                    }}
                />
                <TableRoot withBorder>
                    <TableHeader>
                        <HeaderRowGroup
                            headerGroups={table.getHeaderGroups()}
                        />
                    </TableHeader>

                    <TableBodyContent
                        rows={table.getRowModel().rows}
                        columnCount={columns.length}
                        table={table}
                    />
                </TableRoot>
                <div className={styles.toolbarWrapper}>
                    <TableToolbar
                        table={table}
                        bottomRow={{ right: ['pagination'] }}
                    />
                </div>
            </div>
            <Box gap="xs" justifyContent="flex-end" p="sm">
                <Button variant="secondary" onClick={onBack}>
                    Back to category
                </Button>
                <Button onClick={onContinue}>Continue</Button>
            </Box>
        </div>
    )
}
