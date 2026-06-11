import emptyStateImage from 'assets/img/actions/empty-state-working.png'

import { Box, Button, Heading, Image, Text } from '@gorgias/axiom'

type Props = {
    onCreate: () => void
}

const ActionLibraryEmptyState = ({ onCreate }: Props) => {
    return (
        <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap="xl"
            p="lg"
            minHeight="calc(100vh - 240px)"
        >
            <Image
                src={emptyStateImage}
                alt=""
                width={282}
                fallback={undefined}
            />
            <Box flexDirection="column" alignItems="center" gap="md">
                <Box
                    flexDirection="column"
                    alignItems="center"
                    gap="xs"
                    maxWidth="600px"
                >
                    <Heading size="lg">Power AI Agent with actions</Heading>
                    <Text
                        as="p"
                        color="content-neutral-secondary"
                        align="center"
                    >
                        Automate the tasks your AI Agent and team run every day.
                        Build an action once, then use it across AI Agent and
                        Helpdesk.
                    </Text>
                </Box>
                <Button variant="secondary" onClick={onCreate} as="button">
                    Create action
                </Button>
            </Box>
        </Box>
    )
}

export { ActionLibraryEmptyState }
