import { Box } from '@gorgias/axiom'

export function TicketThreadEventContainer({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Box
            gap="xxxs"
            alignItems="center"
            justifyContent="flex-end"
            flexWrap="wrap"
        >
            {children}
        </Box>
    )
}
