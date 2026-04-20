import { Box, Text } from '@gorgias/axiom'

import type { ConditionsFormValue, DrilldownLevel } from './types'

import css from './ConditionsPopoverContent.less'

export function ClearAllFooter({
    level,
    selectedConditions,
    onClear,
}: {
    level: DrilldownLevel
    selectedConditions: ConditionsFormValue
    onClear: () => void
}) {
    if (
        level.type === 'root' ||
        level.type === 'ticket_fields' ||
        selectedConditions.length === 0
    ) {
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
