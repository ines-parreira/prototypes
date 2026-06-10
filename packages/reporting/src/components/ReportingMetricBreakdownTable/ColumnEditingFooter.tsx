import { Box, Button } from '@gorgias/axiom'
import type { ColumnConfig } from '@gorgias/helpdesk-types'

type Props = {
    setIsOpen: (isOpen: boolean) => void
    columns: ColumnConfig[]
    setVisibleColumns: (columns: string[]) => void
    savedColumns: ColumnConfig[]
    setSavedColumns: (columns: ColumnConfig[]) => void
    onSaveVisibleColumns?: (columns: ColumnConfig[]) => void
}

export function ColumnEditingFooter({
    setIsOpen,
    columns,
    setVisibleColumns,
    savedColumns,
    setSavedColumns,
    onSaveVisibleColumns,
}: Props) {
    return (
        <Box justifyContent="space-between" width="100%">
            <Button
                variant="tertiary"
                onClick={() => {
                    setIsOpen(false)
                    setVisibleColumns(
                        savedColumns
                            .filter((c) => c.visible)
                            .map((c) => c.column_id),
                    )
                }}
            >
                Cancel
            </Button>
            <Button
                variant="primary"
                onClick={() => {
                    setIsOpen(false)
                    setSavedColumns(columns)
                    onSaveVisibleColumns?.(columns)
                }}
            >
                Save
            </Button>
        </Box>
    )
}
