import { Box, Text } from '@gorgias/axiom'

import css from './ConditionsPopoverContent.less'

export function LevelLoadingState() {
    return (
        <Box className={css.emptyState}>
            <Text color="content-neutral-secondary">Loading...</Text>
        </Box>
    )
}

export function LevelEmptyState() {
    return (
        <Box className={css.emptyState}>
            <Text color="content-neutral-secondary">No results</Text>
        </Box>
    )
}
