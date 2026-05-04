import { Box, Button, Icon, Text } from '@gorgias/axiom'

type NewTicketPageInfobarEmptyCustomerStateProps = {
    onSearchCustomers: () => void
}

export function NewTicketPageInfobarEmptyCustomerState({
    onSearchCustomers,
}: NewTicketPageInfobarEmptyCustomerStateProps) {
    return (
        <Box
            flex={1}
            flexDirection="column"
            width="100%"
            paddingLeft="lg"
            paddingRight="lg"
            paddingTop="xxxl"
            paddingBottom="xxxl"
        >
            <Box flexDirection="column" alignItems="center" gap="md">
                <Icon name="user" size="lg" />
                <Text align="center">
                    Add a message recipient or click to search customers by
                    name, email or order no.
                </Text>
                <Button
                    variant="secondary"
                    intent="regular"
                    onClick={onSearchCustomers}
                >
                    Search customers
                </Button>
            </Box>
        </Box>
    )
}
