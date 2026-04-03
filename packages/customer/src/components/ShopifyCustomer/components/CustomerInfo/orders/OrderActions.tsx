import { Box, Button } from '@gorgias/axiom'

type Props = {
    onEdit?: () => void
    onDuplicate?: () => void
    onRefund?: () => void
    onCancel?: () => void
}

export function OrderActions({
    onEdit,
    onDuplicate,
    onRefund,
    onCancel,
}: Props) {
    return (
        <Box flexDirection="row" alignItems="center" gap="xs" pt="xs" pb="md">
            {onEdit && (
                <Button variant="secondary" leadingSlot="edit" onClick={onEdit}>
                    Edit
                </Button>
            )}
            {onDuplicate && (
                <Button
                    variant="secondary"
                    leadingSlot="select-multiple"
                    onClick={onDuplicate}
                >
                    Duplicate
                </Button>
            )}
            {onRefund && (
                <Button
                    variant="secondary"
                    leadingSlot="undo"
                    onClick={onRefund}
                >
                    Refund
                </Button>
            )}
            {onCancel && (
                <Button
                    variant="secondary"
                    leadingSlot="stop-sign"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            )}
        </Box>
    )
}
