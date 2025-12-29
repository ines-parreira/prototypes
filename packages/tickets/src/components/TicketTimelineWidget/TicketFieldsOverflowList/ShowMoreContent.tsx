import { Box, Text } from '@gorgias/axiom'

import type { TicketCustomField } from '../types'

import css from '../TicketTimelineWidget.less'

type ShowMoreContentProps = {
    hiddenFields: TicketCustomField[]
}

export function ShowMoreContent({ hiddenFields }: ShowMoreContentProps) {
    return (
        <ul className={css.overflowList}>
            {hiddenFields.map((field) => {
                return (
                    <li key={field.id}>
                        <Box
                            alignItems="center"
                            marginBottom="xxxxs"
                            gap="xxxxs"
                        >
                            <Text size="sm" variant="regular">
                                {field.label}:
                            </Text>
                            <Text size="sm" variant="bold">
                                {field.shortValueLabel}
                            </Text>
                        </Box>
                    </li>
                )
            })}
        </ul>
    )
}
