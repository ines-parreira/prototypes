import { Box, Button, Text } from '@gorgias/axiom'

type Props = {
    onSyncProfile: () => void
}

export function NoShopifyProfile({ onSyncProfile }: Props) {
    return (
        <Box flexDirection="column" gap="sm">
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
