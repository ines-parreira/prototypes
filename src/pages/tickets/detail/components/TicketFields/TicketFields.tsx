import React, {memo, useEffect, useState} from 'react'
import classNames from 'classnames'

import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import useHasWrapped from 'hooks/useHasWrapped'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import {getTicketFieldState} from 'state/ticket/selectors'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import TicketField from './TicketField'
import css from './TicketFields.less'

function TicketFields() {
    const ticketFieldState = useAppSelector(getTicketFieldState)
    const [showAllFields, setShowAllFields] = useState(false)
    const [ref, hasWrapped] = useHasWrapped<HTMLDivElement>()

    const {data: {data: ticketFieldDefinitions = []} = {}, isLoading} =
        useCustomFieldDefinitions({
            archived: false,
            object_type: 'Ticket',
        })

    const hasErroredHiddenTicketFields = ticketFieldDefinitions.some(
        ({id}) => ticketFieldState[id]?.hasError
    )
    useEffect(() => {
        if (hasErroredHiddenTicketFields) {
            setShowAllFields(true)
        }
    }, [hasErroredHiddenTicketFields])

    if (isLoading || !ticketFieldDefinitions.length) {
        return null
    }

    return (
        <div
            className={css.wrapper}
            style={{
                height: showAllFields ? ref.current.scrollHeight : 24,
            }}
        >
            <div
                ref={ref}
                className={classNames(css.fields, {
                    [css.isExpanded]: showAllFields,
                })}
            >
                {ticketFieldDefinitions.map((fieldDefinition) => (
                    <TicketField
                        key={fieldDefinition.id}
                        fieldDefinition={fieldDefinition}
                        fieldState={ticketFieldState[fieldDefinition.id]}
                    />
                ))}
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
