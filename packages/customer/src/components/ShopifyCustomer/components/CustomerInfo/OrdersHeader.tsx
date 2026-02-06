import { Box, Button, Heading, Tag, Text } from '@gorgias/axiom'

type OrdersHeaderProps = {
    ordersCount: number
    isLoading: boolean
}

export function OrdersHeader({ ordersCount, isLoading }: OrdersHeaderProps) {
    return (
        <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
        >
            <Heading size="md">
                <Box gap="xs" flexDirection="row" alignItems="center">
                    <Text size="md" variant="bold">
                        Orders
                    </Text>
                    {!isLoading && <Tag color="grey">{ordersCount}</Tag>}
                </Box>
            </Heading>
            <Button size="sm" variant="secondary" leadingSlot="add-plus">
                Create order
            </Button>
        </Box>
    )
}
