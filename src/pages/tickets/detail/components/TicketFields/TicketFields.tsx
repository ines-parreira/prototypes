import React, {memo, useCallback} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {CustomFieldValue} from 'models/customField/types'
import {
    useGetCustomFieldDefinitions,
    useUpdateOrDeleteTicketFieldValue,
    OnMutateSettings,
} from 'models/customField/queries'

import {getTicket, getTicketFieldValues} from 'state/ticket/selectors'
import TicketField from './TicketField'
import css from './TicketFields.less'

function TicketFields() {
    const ticketId = useAppSelector(getTicket).id
    const ticketFieldValues = useAppSelector(getTicketFieldValues)
    const {mutate} = useUpdateOrDeleteTicketFieldValue(ticketId)

    const {data: {data: ticketFieldDefinitions = []} = {}, isLoading} =
        useGetCustomFieldDefinitions({
            archived: false,
            object_type: 'Ticket',
        })

    const handleChange = useCallback(
        (
            id: CustomFieldValue['id'],
            value: CustomFieldValue['value'],
            settings?: OnMutateSettings
        ) => mutate({id, value, settings}),
        [mutate]
    )

    if (isLoading || !ticketFieldDefinitions.length) {
        return null
    }

    return (
        <div className={css.wrapper}>
            {ticketFieldDefinitions
                .sort(
                    ({priority: previousPriority}, {priority: nextPriority}) =>
                        previousPriority - nextPriority
                )
                .map((fieldData) => {
                    return (
                        <TicketField
                            key={fieldData.id}
                            fieldData={fieldData}
                            value={ticketFieldValues[fieldData.id]?.value}
                            onChange={handleChange}
                        />
                    )
                })}
        </div>
    )
}

// Prevent crazy amount of renders coming from parent
export default memo(TicketFields)
