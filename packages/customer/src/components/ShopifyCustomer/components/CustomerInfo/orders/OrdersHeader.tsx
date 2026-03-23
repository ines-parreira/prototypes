import { Box, Button, Heading, Tag, Text } from '@gorgias/axiom'

type OrdersHeaderProps = {
    title?: string
    ordersCount: number
    isLoading: boolean
    onCreateOrder?: () => void
}

export function OrdersHeader({
    title = 'Orders',
    ordersCount,
    isLoading,
    onCreateOrder,
}: OrdersHeaderProps) {
    return (
        <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
        >
            <Heading size="md">
                <Box gap="xs" flexDirection="row" alignItems="center">
                    <Text size="md" variant="bold">
                        {title}
                    </Text>
                    {!isLoading && <Tag color="grey">{ordersCount}</Tag>}
                </Box>
            </Heading>
            {onCreateOrder && (
                <Button
                    size="sm"
                    variant="secondary"
                    leadingSlot="add-plus"
                    onClick={onCreateOrder}
                >
                    Create order
                </Button>
            )}
        </Box>
    )
}
