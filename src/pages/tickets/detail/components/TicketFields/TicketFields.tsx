import classNames from 'classnames'
import React, {memo, useEffect, useMemo, useState} from 'react'

import {AI_MANAGED_TYPES} from 'custom-fields/constants'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useHasWrapped from 'hooks/useHasWrapped'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {setHasAttemptedToCloseTicket} from 'state/ticket/actions'
import {
    getHasAttemptedToCloseTicket,
    getTicketFieldState,
} from 'state/ticket/selectors'

import useHeight from './hooks/useHeight'
import TicketField from './TicketField'
import css from './TicketFields.less'

function TicketFields() {
    const dispatch = useAppDispatch()
    const ticketFieldState = useAppSelector(getTicketFieldState)
    const [showAllFields, setShowAllFields] = useState(false)
    const [ref, hasWrapped] = useHasWrapped<HTMLDivElement>()
    const height = useHeight(ref)
    const hasAttemptedToCloseTicket = useAppSelector(
        getHasAttemptedToCloseTicket
    )

    const {data: {data: ticketFieldDefinitions = []} = {}, isLoading} =
        useCustomFieldDefinitions({
            archived: false,
            object_type: 'Ticket',
        })

    // Hide AI managed fields
    // TODO(DevRel): Remove this once ticket conditional fields are released
    const filteredTicketFieldDefinitions = useMemo(
        () =>
            ticketFieldDefinitions.filter(
                (definition) =>
                    !definition.managed_type ||
                    !Object.values(AI_MANAGED_TYPES).includes(
                        definition.managed_type
                    )
            ),
        [ticketFieldDefinitions]
    )

    const hasErroredTicketFields = filteredTicketFieldDefinitions.some(
        ({id}) => ticketFieldState[id]?.hasError
    )

    useEffect(() => {
        if (
            hasAttemptedToCloseTicket &&
            hasErroredTicketFields &&
            !showAllFields
        ) {
            setShowAllFields(true)
            dispatch(setHasAttemptedToCloseTicket(false))
        }
    }, [
        dispatch,
        hasAttemptedToCloseTicket,
        hasErroredTicketFields,
        showAllFields,
    ])

    if (isLoading || !filteredTicketFieldDefinitions.length) {
        return null
    }

    return (
        <div
            className={css.wrapper}
            style={{
                height: showAllFields ? height : 24,
            }}
        >
            <div
                ref={ref}
                className={classNames(css.fields, {
                    [css.isExpanded]: showAllFields,
                })}
            >
                {filteredTicketFieldDefinitions.map((fieldDefinition) => {
                    return (
                        <TicketField
                            key={fieldDefinition.id}
                            fieldDefinition={fieldDefinition}
                            fieldState={ticketFieldState[fieldDefinition.id]}
                        />
                    )
                })}
            </div>

            <div className={css.buttonWrapper}>
                {hasWrapped && (
                    <Button
                        fillStyle="ghost"
                        size="small"
                        onClick={() => setShowAllFields(!showAllFields)}
                    >
                        <ButtonIconLabel
                            className={css.button}
                            position="right"
                            icon={showAllFields ? 'expand_less' : 'expand_more'}
                        >
                            {`Show ${showAllFields ? 'less' : 'more'}`}
                        </ButtonIconLabel>
                    </Button>
                )}
            </div>
        </div>
    )
}

export default memo(TicketFields)
