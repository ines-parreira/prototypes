import { Box } from '@gorgias/axiom'

export function TicketInfobarTicketDetailsTagsContainer({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Box marginLeft="md" marginRight="md">
            {children}
        </Box>
    )
}
