import { Box, Dot } from '@gorgias/axiom'

type VoiceCallTimelineProps = {
    children: React.ReactNode
    fullWidth?: boolean
}

export function VoiceCallTimeline({ children }: VoiceCallTimelineProps) {
    return (
        <Box w="100%" flexDirection="column" gap="xs">
            {children}
        </Box>
    )
}

type VoiceCallTimelineItemProps = {
    children: React.ReactNode
}

export function VoiceCallTimelineItem({
    children,
}: VoiceCallTimelineItemProps) {
    return (
        <Box gap="xs" alignItems="flex-start" pl="xxxs">
            <Box h={16} alignItems="center">
                <Dot size="sm" color="grey" />
            </Box>
            {children}
        </Box>
    )
}
