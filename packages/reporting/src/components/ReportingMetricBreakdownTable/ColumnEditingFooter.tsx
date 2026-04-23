import { Box, Button } from '@gorgias/axiom'

type Props = {
    setIsOpen: (isOpen: boolean) => void
    visibleColumns: string[]
    setVisibleColumns: (columns: string[]) => void
    savedColumns: string[]
    setSavedColumns: (columns: string[]) => void
    onSaveVisibleColumns?: (columns: string[]) => void
}

export function ColumnEditingFooter({
    setIsOpen,
    visibleColumns,
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
                    setVisibleColumns(savedColumns)
                }}
            >
                Cancel
            </Button>
            <Button
                variant="primary"
                onClick={() => {
                    setIsOpen(false)
                    setSavedColumns(visibleColumns)
                    onSaveVisibleColumns?.(visibleColumns)
                }}
            >
                Save
            </Button>
        </Box>
    )
}
