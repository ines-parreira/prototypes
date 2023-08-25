import React, {useState, useMemo, useEffect} from 'react'
import {Collapse} from 'reactstrap'
import {updateCustomFieldState} from 'state/ticket/actions'
import {createInputId} from 'pages/tickets/detail/components/TicketFields/components/fields/DropdownField/DropdownField'
import {Ticket} from 'models/ticket/types'
import {useUpdateOrDeleteTicketFieldValue} from 'hooks/customField/useUpdateOrDeleteTicketFieldValue'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import useAppDispatch from 'hooks/useAppDispatch'
import InTicketSuggestionContainer from './InTicketSuggestionContainer'
import SuggestionHeader from './SuggestionHeader'

import css from './AISuggestionContactReason.less'

type Props = {
    ticket: Ticket
}

export default function ContactReasonSuggestion({ticket}: Props) {
    const dispatch = useAppDispatch()
    const {mutate} = useUpdateOrDeleteTicketFieldValue()
    const [isConfirmed, setConfirmed] = useState(false)
    const [collapse, setCollapse] = useState(false)

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

    const confirmPrediction = () => {
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
    }

    useEffect(() => {
        if (isConfirmed) {
            setTimeout(() => {
                setCollapse(true)
            }, 1500)
        }
    }, [isConfirmed])

    return (
        <Collapse
            className={css.container}
            isOpen={!collapse}
            onClosed={confirmPrediction}
        >
            <InTicketSuggestionContainer>
                <SuggestionHeader
                    actionsContent={
                        <div className={css.buttons}>
                            {isConfirmed ? (
                                <span className={css.feedback}>
                                    Thanks for the feedback!
                                </span>
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
                                        onClick={() => setConfirmed(true)}
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
                            <b>
                                {contactReasonPrediction?.prediction?.predicted.replace(
                                    /::/g,
                                    ' - '
                                )}
                            </b>{' '}
                            as the Contact reason.
                        </span>
                    }
                />
            </InTicketSuggestionContainer>
        </Collapse>
    )
}
