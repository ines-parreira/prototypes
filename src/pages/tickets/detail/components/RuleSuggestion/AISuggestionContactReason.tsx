import React, {useState, useMemo} from 'react'
import {updateCustomFieldState} from 'state/ticket/actions'
import {createInputId} from 'pages/tickets/detail/components/TicketFields/components/fields/DropdownField/DropdownField'
import {Ticket} from 'models/ticket/types'
import {useUpdateOrDeleteTicketFieldValue} from 'hooks/customField/useUpdateOrDeleteTicketFieldValue'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import useAppDispatch from 'hooks/useAppDispatch'
import InTicketSuggestionContainer from './InTicketSuggestionContainer'
import SuggestionHeader from './SuggestionHeader'

import css from './RuleSuggestion.less'

type Props = {
    ticket: Ticket
}

export default function ContactReasonSuggestion({ticket}: Props) {
    const dispatch = useAppDispatch()
    const {mutate} = useUpdateOrDeleteTicketFieldValue()
    const [isConfirmed, setConfirmed] = useState(false)

    const contactReasonPrediction = useMemo(
        () =>
            Object.values(ticket.custom_fields || {}).find(
                ({prediction, value}) => {
                    return (
                        prediction?.predicted === value &&
                        prediction?.display &&
                        prediction?.modified === false &&
                        prediction?.confirmed === false
                    )
                }
            ),
        [ticket]
    )

    const contactReasonDropdownInputId = createInputId(
        ticket.id,
        contactReasonPrediction?.id ?? ''
    )

    const contactReasonElement = document.getElementById(
        contactReasonDropdownInputId
    )

    const handleChangeReason = () => {
        contactReasonElement?.focus()
    }

    const handleConfirm = () => {
        setConfirmed(true)
        setTimeout(() => {
            if (!contactReasonPrediction || !contactReasonPrediction.prediction)
                return
            dispatch(
                updateCustomFieldState({
                    id: contactReasonPrediction.id,
                    value: contactReasonPrediction.value,
                    prediction: {
                        ...contactReasonPrediction.prediction,
                        confirmed: true,
                        modified: true,
                    },
                })
            )
            mutate([
                {
                    fieldType: 'Ticket',
                    holderId: ticket.id,
                    fieldId: contactReasonPrediction.id,
                    value: contactReasonPrediction.value,
                },
            ])
        }, 1500)
    }

    return (
        <InTicketSuggestionContainer>
            <SuggestionHeader
                actionsContent={
                    <div className={css.buttons}>
                        {isConfirmed ? (
                            <span>Thanks for the feedback!</span>
                        ) : (
                            <>
                                <Button
                                    size="small"
                                    intent="secondary"
                                    onClick={handleChangeReason}
                                >
                                    Change reason
                                </Button>
                                <Button
                                    intent="primary"
                                    size="small"
                                    onClick={handleConfirm}
                                >
                                    <ButtonIconLabel
                                        icon="check_circle"
                                        position="left"
                                    >
                                        Confirm
                                    </ButtonIconLabel>
                                </Button>
                            </>
                        )}
                    </div>
                }
                infoContent={
                    <span>
                        Our AI detected{' '}
                        <b>{contactReasonPrediction?.prediction?.predicted}</b>{' '}
                        as the Contact reason.
                    </span>
                }
            />
        </InTicketSuggestionContainer>
    )
}
