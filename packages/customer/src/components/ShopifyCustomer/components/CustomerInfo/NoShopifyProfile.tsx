import { Box, Button, Icon, Text } from '@gorgias/axiom'

type Props = {
    onSyncProfile: () => void
}

export function NoShopifyProfile({ onSyncProfile }: Props) {
    return (
        <Box flexDirection="column" gap="sm">
            <Box flexDirection="row" gap="xs">
                <Icon name="app-shopify" size="md" />
                <Text size="md" variant="bold">
                    Shopify
                </Text>
            </Box>
            <Text>
                No matching profile found. Do you want to sync this customer to
                Shopify?
            </Text>
            <Box>
                <Button onClick={onSyncProfile}>Sync profile</Button>
            </Box>
        </Box>
    )
}
