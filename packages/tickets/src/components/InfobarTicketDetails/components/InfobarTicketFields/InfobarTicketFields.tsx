import { useState } from 'react'

import {
    Box,
    OverflowList,
    OverflowListShowLess,
    OverflowListShowMore,
    Skeleton,
} from '@gorgias/axiom'

import { useDefaultExpandedLineCount } from './hooks/useDefaultExpandedLineCount'
import { useTicketFields } from './hooks/useTicketFields'
import { InfobarTicketField } from './InfobarTicketField'
import type { TicketFieldsState } from './store/useTicketFieldsStore'
import type { FieldEventHandlerParams } from './utils/constants'

import css from './InfobarTicketFields.less'

type InfobarTicketFieldsProps = {
    onFieldChange: ({ field, nextValue }: FieldEventHandlerParams) => void
    onFieldBlur: ({ field, nextValue }: FieldEventHandlerParams) => void
    fields: TicketFieldsState
}

export function InfobarTicketFields({
    fields,
    onFieldChange,
    onFieldBlur,
}: InfobarTicketFieldsProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const { ticketFields, isLoading } = useTicketFields()
    const defaultLineCount = useDefaultExpandedLineCount(fields)

    if (isLoading) {
        return <Skeleton count={3} />
    }

    if (ticketFields.length === 0) {
        return null
    }

    return (
        <OverflowList
            className={css.overflowList}
            nonExpandedLineCount={defaultLineCount}
            isExpanded={isExpanded}
            onExpandedChange={setIsExpanded}
            key={`ticket-fields-overflow-list-${defaultLineCount}-${isExpanded}`}
            gap={1}
        >
            {ticketFields.map((ticketField) => (
                <InfobarTicketField
                    key={ticketField.fieldDefinition.id}
                    field={ticketField}
                    fieldState={fields[ticketField.fieldDefinition.id] ?? {}}
                    onFieldChange={onFieldChange}
                    onFieldBlur={onFieldBlur}
                />
            ))}
            <Box paddingTop="xxs" className={css.overflowListToggle}>
                <OverflowListShowMore leadingSlot="arrow-chevron-down">
                    Show more
                </OverflowListShowMore>
            </Box>
            <Box paddingTop="xxs" className={css.overflowListToggle}>
                <OverflowListShowLess leadingSlot="arrow-chevron-up">
                    Show less
                </OverflowListShowLess>
            </Box>
        </OverflowList>
    )
}
