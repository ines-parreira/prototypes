import { Box, Heading, Tag, Text } from '@gorgias/axiom'

type OrdersHeaderProps = {
    ordersCount: number
    isLoading: boolean
}

export function DraftOrdersHeader({
    ordersCount,
    isLoading,
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
                        Draft orders
                    </Text>
                    {!isLoading && <Tag color="grey">{ordersCount}</Tag>}
                </Box>
            </Heading>
        </Box>
    )
}
