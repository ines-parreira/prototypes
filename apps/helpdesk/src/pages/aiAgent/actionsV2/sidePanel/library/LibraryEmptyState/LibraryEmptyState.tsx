import { Box, Button, Heading, Text } from '@gorgias/axiom'

const REQUEST_APP_URL = 'https://link.gorgias.com/actions'

type Props = {
    title?: string
    description?: string
    requestAppUrl?: string
}

export const LibraryEmptyState = ({
    title = 'No actions found',
    description = 'Try a different search',
    requestAppUrl = REQUEST_APP_URL,
}: Props) => (
    <Box
        flexDirection="column"
        alignItems="center"
        gap="md"
        paddingTop="lg"
        paddingBottom="lg"
        width="100%"
    >
        <Box flexDirection="column" alignItems="center" gap="xxxs">
            <Heading size="sm">{title}</Heading>
            <Text size="sm" color="content-neutral-secondary">
                {description}
            </Text>
        </Box>
        <Button
            as="a"
            href={requestAppUrl}
            target="_blank"
            rel="noreferrer"
            variant="secondary"
            size="sm"
            intent="regular"
        >
            Request app
        </Button>
    </Box>
)
