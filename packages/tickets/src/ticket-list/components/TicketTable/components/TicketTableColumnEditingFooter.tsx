import { Box, Button } from '@gorgias/axiom'

type Props = {
    visibleColumns: string[]
    canSaveForEveryone: boolean
    isSavingForEveryone: boolean
    onClose: () => void
    onResetToDefault: () => void
    onSaveForEveryone: (visibleColumns: string[]) => void | Promise<void>
}

export function TicketTableColumnEditingFooter({
    visibleColumns,
    canSaveForEveryone,
    isSavingForEveryone,
    onClose,
    onResetToDefault,
    onSaveForEveryone,
}: Props) {
    async function handleSaveForEveryone() {
        await onSaveForEveryone(visibleColumns)
        onClose()
    }

    function handleRestoreSavedView() {
        onClose()
        onResetToDefault()
    }

    return (
        <Box
            alignItems="center"
            gap="sm"
            justifyContent="flex-end"
            width="100%"
        >
            <Button
                size="sm"
                variant="tertiary"
                onClick={handleRestoreSavedView}
            >
                Restore saved view
            </Button>
            {canSaveForEveryone ? (
                <Button
                    size="sm"
                    isLoading={isSavingForEveryone}
                    onClick={handleSaveForEveryone}
                >
                    Save for everyone
                </Button>
            ) : null}
        </Box>
    )
}
