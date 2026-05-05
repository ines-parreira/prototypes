import { Box, Button, Text } from '@gorgias/axiom'

type Props = {
    firstName?: string
    lastName?: string
    onClose?: () => void
}

export function TimelineHeader({ firstName, lastName, onClose }: Props) {
    const title =
        firstName || lastName
            ? `${firstName || ''} ${lastName || ''} Timeline`.trim()
            : 'Customer timeline'

    return (
        <Box alignItems="center" justifyContent="space-between" mb="xxs">
            <Text size="md" variant="bold">
                {title}
            </Text>
            {onClose && (
                <Button
                    as="button"
                    icon="close"
                    intent="regular"
                    size="sm"
                    variant="tertiary"
                    onClick={onClose}
                    aria-label="Close timeline"
                />
            )}
        </Box>
    )
}
