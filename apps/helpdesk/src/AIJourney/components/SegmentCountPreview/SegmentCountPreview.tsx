import { Box, Card, Heading, Skeleton, Tag } from '@gorgias/axiom'

export const SegmentCountPreview = ({
    count,
    isLoading = false,
}: {
    count?: number
    isLoading?: boolean
}) => {
    return (
        <Card
            style={{
                borderColor: 'var(--border-additional-purple)',
            }}
        >
            <Box gap="xs">
                <Heading size="md">Segment preview</Heading>
                {isLoading ? (
                    <Skeleton width={120} height={24} />
                ) : (
                    <Tag color="purple">
                        {count ? `±${count.toLocaleString()}` : 0} shoppers
                    </Tag>
                )}
            </Box>
        </Card>
    )
}
