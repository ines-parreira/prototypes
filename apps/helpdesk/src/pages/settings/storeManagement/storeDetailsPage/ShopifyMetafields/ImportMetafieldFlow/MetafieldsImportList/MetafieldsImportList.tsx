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

import type { Field } from '../../MetafieldsTable/types'
import { MetafieldEnum } from '../../MetafieldTypeItem/MetafieldTypeItem'
import type { MetafieldCategory } from '../../types'
import { getCategoryLabel } from '../../utils/getCategoryLabel'
import { getMetafieldTypeLabel } from '../../utils/getMetafieldTypeLabel'
import { isSupportedMetafieldType } from '../../utils/isSupportedMetafieldType'
import { useFilteredMetafields } from '../hooks/useFilteredMetafields'
import { useMetafieldsFiltersHandler } from '../hooks/useMetafieldsFiltersHandler'
import MaxFieldsImportedBanner from '../MaxMetafieldsImportedBanner/MaxFieldsImportedBanner'
import { columns } from './Columns'
import { mockImportableFields } from './data'

import styles from './MetafieldsImportList.less'

type MetafieldsImportListProps = {
    category: MetafieldCategory
    selectedMetafields: Field[]
    onSelectionChange: (selectedFields: Field[]) => void
    onBack: () => void
    onContinue: () => void
    maxFieldsImported?: boolean
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
    maxFieldsImported,
}: MetafieldsImportListProps) {
    const filteredData = useFilteredMetafields({
        data: mockImportableFields,
        category,
    })

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
        const selectedFields = filteredData.filter((field) =>
            selectedIds.includes(field.id),
        )
        onSelectionChange(selectedFields)
    }

    const table = useTable({
        data: filteredData,
        columns,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: true,
        },
        globalFilterConfig: {
            enableGlobalFilter: true,
            globalFilterFn: 'includesString',
        },
        selectionConfig: {
            enableRowSelection: (row) => {
                return isSupportedMetafieldType(row.original.type)
            },
            initialRowSelection,
            onRowSelectionChange: handleRowSelectionChange,
        },
        additionalOptions: {
            getRowId: (row) => row.id,
        },
    })

    const handleFiltersChange = useMetafieldsFiltersHandler({ table })

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

                {maxFieldsImported ? <MaxFieldsImportedBanner /> : null}
            </Box>
            <div
                className={cn(styles.toolbarContainer, {
                    [styles.maxFieldsImported]: !!maxFieldsImported,
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
