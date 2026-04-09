import { Box, Skeleton } from '@gorgias/axiom'

export const ReturnOrderFlowViewSkeleton = () => (
    <Box flexDirection="column" gap="md">
        <Skeleton height={24} width={400} />
        <Box flexDirection="column" gap="xxs">
            <Skeleton height={20} width={120} />
            <Skeleton height={16} width={300} />
            <Skeleton height={32} width={320} />
        </Box>
        <Box flexDirection="column" gap="xxs">
            <Skeleton height={20} width={120} />
            <Skeleton height={32} width={320} />
        </Box>
    </Box>
)
