import { Box, OverflowListItem, Text } from '@gorgias/axiom'

import type { TicketCustomField } from '../types'

import css from '../TicketTimelineWidget.less'

type CustomFieldItemProps = {
    field: TicketCustomField
}

export function CustomFieldItem({ field }: CustomFieldItemProps) {
    return (
        <OverflowListItem key={field.id}>
            <Box marginRight="xxs" height="lg" alignItems="center">
                <Text size="sm" variant="regular">
                    <span className={css.fieldLabel}>{`${field.label}: `}</span>
                    <span className={css.fieldValue}>
                        {field.shortValueLabel}
                    </span>
                </Text>
            </Box>
        </OverflowListItem>
    )
}
