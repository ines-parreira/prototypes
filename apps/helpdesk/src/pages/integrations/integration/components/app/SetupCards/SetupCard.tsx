import type { ComponentProps, ReactNode } from 'react'

import { Box, Card, Heading, Text } from '@gorgias/axiom'

type SetupCardProps = {
    title: string
    description: string
    action: ReactNode
    descriptionColor?: ComponentProps<typeof Text>['color']
}

export function SetupCard({
    title,
    description,
    action,
    descriptionColor,
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
            <Text color={descriptionColor}>{description}</Text>
        </Card>
    )
}
