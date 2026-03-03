import {
    Box,
    OverflowList,
    OverflowListShowLess,
    OverflowListShowMore,
    Skeleton,
} from '@gorgias/axiom'

import { useTicketFields } from './hooks/useTicketFields'
import {
    DEFAULT_VISIBLE_FIELD_COUNT,
    useTicketFieldsDisplay,
} from './hooks/useTicketFieldsDisplay'
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
    const { isExpanded, setIsExpanded } = useTicketFieldsDisplay()
    const { ticketFields, isLoading } = useTicketFields()

    if (isLoading) {
        return <Skeleton count={3} />
    }

    if (ticketFields.length === 0) {
        return null
    }

    return (
        <OverflowList
            className={css.overflowList}
            nonExpandedLineCount={DEFAULT_VISIBLE_FIELD_COUNT}
            isExpanded={isExpanded}
            onExpandedChange={setIsExpanded}
            key={`ticket-fields-overflow-list-${isExpanded}`}
            gap="xxxs"
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
            <Box className={css.overflowListToggle}>
                <OverflowListShowMore leadingSlot="arrow-chevron-down">
                    Show more
                </OverflowListShowMore>
            </Box>
            <Box className={css.overflowListToggle}>
                <OverflowListShowLess leadingSlot="arrow-chevron-up">
                    Show less
                </OverflowListShowLess>
            </Box>
        </OverflowList>
    )
}
