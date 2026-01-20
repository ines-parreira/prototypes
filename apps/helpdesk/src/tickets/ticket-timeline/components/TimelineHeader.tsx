import { Box, Text } from '@gorgias/axiom'

type Props = {
    firstName?: string
    lastName?: string
}

export function TimelineHeader({ firstName, lastName }: Props) {
    const title =
        firstName || lastName
            ? `${firstName || ''} ${lastName || ''} Timeline`.trim()
            : 'Customer timeline'

    return (
        <Box alignItems="center" justifyContent="space-between" mb="xxs">
            <Text size="md" variant="bold">
                {title}
            </Text>
        </Box>
    )
}
