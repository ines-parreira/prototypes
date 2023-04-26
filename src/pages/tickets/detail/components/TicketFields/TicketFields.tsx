import React, {memo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {useGetCustomFieldDefinitions} from 'models/customField/queries'

import {getTicket, getTicketFieldState} from 'state/ticket/selectors'
import TicketField from './TicketField'
import css from './TicketFields.less'

function TicketFields() {
    const ticketState = useAppSelector(getTicket)
    const ticketId = ticketState.id
    const ticketFieldState = useAppSelector(getTicketFieldState)

    const {data: {data: ticketFieldDefinitions = []} = {}, isLoading} =
        useGetCustomFieldDefinitions({
            archived: false,
            object_type: 'Ticket',
        })

    // @TODO remove the ticket id check once the issue below is solved
    // https://linear.app/gorgias/issue/APPED-1514/custom-field-value-cannot-be-set-in-a-new-ticket
    if (isLoading || !ticketFieldDefinitions.length || !ticketId) {
        return null
    }

    return (
        <div className={css.wrapper}>
            {ticketFieldDefinitions.map((fieldDefinition) => {
                return (
                    <TicketField
                        key={fieldDefinition.id}
                        fieldDefinition={fieldDefinition}
                        fieldState={ticketFieldState[fieldDefinition.id]}
                    />
                )
            })}
        </div>
    )
}

// Prevent crazy amount of renders coming from parent
export default memo(TicketFields)
