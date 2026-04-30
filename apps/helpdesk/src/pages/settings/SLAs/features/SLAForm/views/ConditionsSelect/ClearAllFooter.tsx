import { Box, Text } from '@gorgias/axiom'

import type { ConditionsFormValue } from './types'

import css from './ConditionsPopoverContent.less'

export function ClearAllFooter({
    selectedConditions,
    onClear,
}: {
    selectedConditions: ConditionsFormValue
    onClear: () => void
}) {
    if (selectedConditions.length === 0) {
        return null
    }

    return (
        <Box className={css.clearAllFooter}>
            <button
                type="button"
                className={css.clearAllButton}
                onClick={onClear}
            >
                <Text variant="medium" size="md">
                    Clear all
                </Text>
            </button>
        </Box>
    )
}
