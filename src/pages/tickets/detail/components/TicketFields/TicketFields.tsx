import React, {memo, useEffect, useState} from 'react'
import classNames from 'classnames'

import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
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

import TicketField from './TicketField'
import css from './TicketFields.less'
import useHeight from './components/hooks/useHeight'

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

    const hasErroredTicketFields = ticketFieldDefinitions.some(
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

    if (isLoading || !ticketFieldDefinitions.length) {
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
