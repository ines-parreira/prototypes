import { useEffect, useMemo } from 'react'

import {
    OverflowList,
    OverflowListShowLess,
    OverflowListShowMore,
    Skeleton,
} from '@gorgias/axiom'

import { useTicketFields } from './hooks/useTicketFields'
import { InfobarTicketField } from './InfobarTicketField'
import { useTicketFieldsStore } from './store/useTicketFieldsStore'

import css from './InfobarTicketFields.less'

type InfobarTicketFieldsProps = {
    ticketId: string
}

export function InfobarTicketFields({ ticketId }: InfobarTicketFieldsProps) {
    const { ticketFields, isLoading } = useTicketFields(ticketId)

    const fields = useTicketFieldsStore((state) => state.fields)

    const hasAttemptedToCloseTicket = useTicketFieldsStore(
        (state) => state.hasAttemptedToCloseTicket,
    )
    const setHasAttemptedToCloseTicket = useTicketFieldsStore(
        (state) => state.setHasAttemptedToCloseTicket,
    )

    const hasErroredFields = useMemo(
        () => Object.values(fields).some((field) => field.hasError),
        [fields],
    )

    useEffect(() => {
        if (hasAttemptedToCloseTicket && hasErroredFields) {
            setHasAttemptedToCloseTicket(false)
        }
    }, [
        hasAttemptedToCloseTicket,
        hasErroredFields,
        setHasAttemptedToCloseTicket,
    ])

    if (isLoading) {
        return <Skeleton count={3} />
    }

    if (ticketFields.length === 0) {
        return null
    }

    return (
        <OverflowList
            className={css.overflowList}
            nonExpandedLineCount={ticketFields.length}
        >
            {ticketFields.map((ticketField) => (
                <InfobarTicketField
                    key={ticketField.fieldDefinition.id}
                    field={ticketField}
                    ticketId={Number(ticketId)}
                />
            ))}
            <OverflowListShowMore leadingSlot="arrow-chevron-down">
                Show more
            </OverflowListShowMore>
            <OverflowListShowLess leadingSlot="arrow-chevron-up">
                Show less
            </OverflowListShowLess>
        </OverflowList>
    )
}
