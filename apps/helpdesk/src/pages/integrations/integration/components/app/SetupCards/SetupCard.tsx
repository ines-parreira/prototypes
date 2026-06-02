import type { ReactNode } from 'react'

import { Box, Card, Heading, Text } from '@gorgias/axiom'

type SetupCardProps = {
    title: string
    description: string
    action: ReactNode
}

export default function SetupCard({
    title,
    description,
    action,
}: SetupCardProps) {
    return (
        <Card elevation="mid" p="md" w="100%" flexDirection="column" gap="xs">
            <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="flex-start"
                gap="md"
            >
                <Heading size="sm">{title}</Heading>
                <Box flexShrink={0}>{action}</Box>
            </Box>
            <Text>{description}</Text>
        </Card>
    )
}
