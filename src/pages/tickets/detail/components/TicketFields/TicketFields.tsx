import React, {memo, useCallback} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {CustomFieldState} from 'models/customField/types'
import {
    useGetCustomFieldDefinitions,
    useUpdateOrDeleteTicketFieldValue,
    OnMutateSettings,
} from 'models/customField/queries'

import {getTicket, getTicketFieldState} from 'state/ticket/selectors'
import TicketField from './TicketField'
import css from './TicketFields.less'

function TicketFields() {
    const ticketState = useAppSelector(getTicket)
    const ticketId = ticketState.id
    const ticketFieldState = useAppSelector(getTicketFieldState)
    const {mutate} = useUpdateOrDeleteTicketFieldValue(ticketId)

    const {data: {data: ticketFieldDefinitions = []} = {}, isLoading} =
        useGetCustomFieldDefinitions({
            archived: false,
            object_type: 'Ticket',
        })

    const handleChange = useCallback(
        (
            id: CustomFieldState['id'],
            value: CustomFieldState['value'],
            settings?: OnMutateSettings
        ) => mutate({id, value, settings}),
        [mutate]
    )

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
                        onChange={handleChange}
                    />
                )
            })}
        </div>
    )
}

// Prevent crazy amount of renders coming from parent
export default memo(TicketFields)
