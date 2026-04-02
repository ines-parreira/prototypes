import type { SizeValue } from '@gorgias/axiom'
import { Box, Heading, Text } from '@gorgias/axiom'

type NoDataPlaceholderProps = {
    height?: SizeValue
}
const DEFAULT_HEIGHT = '274px'

export const NoDataPlaceholder = ({
    height = DEFAULT_HEIGHT,
}: NoDataPlaceholderProps) => {
    return (
        <Box
            height={height}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            marginBottom="lg"
            gap="xs"
        >
            <Heading size="sm">No data found</Heading>
            <Text size="md" color="content-neutral-secondary">
                Try to adjust your report filters.
            </Text>
        </Box>
    )
}
