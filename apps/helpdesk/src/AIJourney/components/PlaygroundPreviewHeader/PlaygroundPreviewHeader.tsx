import { Avatar, Box, Size, Text } from '@gorgias/axiom'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

export const PlaygroundPreviewHeader = () => {
    const { data: currentUser } = useGetCurrentUser()
    const customerName = currentUser?.data?.name || 'John Doe'
    const customerInitials = customerName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <Box padding={Size.Sm} flexDirection="column" alignItems="center">
            <Avatar size={Size.Xl} name={customerInitials} />
            <Text size={Size.Xs}>{customerName}</Text>
        </Box>
    )
}
