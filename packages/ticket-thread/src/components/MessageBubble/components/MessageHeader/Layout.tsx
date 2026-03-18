import { Box } from '@gorgias/axiom'

export type MessageHeaderContainerProps = {
    children: React.ReactNode
}

export function MessageHeaderContainer({
    children,
}: MessageHeaderContainerProps) {
    return (
        <Box justifyContent="space-between" alignItems="center">
            {children}
        </Box>
    )
}
