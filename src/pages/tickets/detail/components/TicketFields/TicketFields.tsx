import React, {memo} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {getTicketFieldState} from 'state/ticket/selectors'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'

import TicketField from './TicketField'
import css from './TicketFields.less'

function TicketFields() {
    const ticketFieldState = useAppSelector(getTicketFieldState)

    const {data: {data: ticketFieldDefinitions = []} = {}, isLoading} =
        useCustomFieldDefinitions({
            archived: false,
            object_type: 'Ticket',
        })

    if (isLoading || !ticketFieldDefinitions.length) {
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
                        isLarge={ticketFieldDefinitions.length < 4}
                    />
                )
            })}
        </div>
    )
}

// Prevent crazy amount of renders coming from parent
export default memo(TicketFields)
