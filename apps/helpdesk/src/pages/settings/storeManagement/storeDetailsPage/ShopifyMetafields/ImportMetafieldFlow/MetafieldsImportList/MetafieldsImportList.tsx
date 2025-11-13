import { useMemo } from 'react'

import cn from 'classnames'

import {
    Box,
    Button,
    HeaderRowGroup,
    Heading,
    RowSelectionState,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    Text,
    useTable,
} from '@gorgias/axiom'

import { Field } from '../../MetafieldsTable/types'
import { MetafieldCategory } from '../../types'
import { getCategoryLabel } from '../../utils/getCategoryLabel'
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

export default function MetafieldsImportList({
    category,
    selectedMetafields,
    onSelectionChange,
    onBack,
    onContinue,
    maxFieldsImported,
}: MetafieldsImportListProps) {
    const filteredData = useMemo(
        () =>
            mockImportableFields.filter((field) => field.category === category),
        [category],
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
            enableRowSelection: true,
            initialRowSelection,
            onRowSelectionChange: handleRowSelectionChange,
        },
        additionalOptions: {
            getRowId: (row) => row.id,
        },
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

                {maxFieldsImported ? <MaxFieldsImportedBanner /> : null}
            </Box>
            <div
                className={cn({
                    [styles.maxFieldsImported]: !!maxFieldsImported,
                })}
            >
                <TableToolbar
                    table={table}
                    left={['search']}
                    right={['selectCount']}
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
