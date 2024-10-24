import React, {useState, useMemo, useEffect} from 'react'
import {Collapse} from 'reactstrap'

import {useUpdateOrDeleteTicketFieldValue} from 'custom-fields/hooks/queries/useUpdateOrDeleteTicketFieldValue'
import useAppDispatch from 'hooks/useAppDispatch'
import {Ticket} from 'models/ticket/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {createInputId} from 'pages/tickets/detail/components/TicketFields/components/fields/DropdownField'
import {updateCustomFieldState} from 'state/ticket/actions'

import css from './AISuggestionContactReason.less'
import InTicketSuggestionContainer from './InTicketSuggestionContainer'
import SuggestionHeader from './SuggestionHeader'

type Props = {
    ticket: Ticket
}

export default function ContactReasonSuggestion({ticket}: Props) {
    const dispatch = useAppDispatch()
    const {mutate} = useUpdateOrDeleteTicketFieldValue()
    const [isConfirmed, setConfirmed] = useState(false)
    const [collapse, setCollapse] = useState(false)
    const [isCollpsed, setIsCollpsed] = useState(false)

    const contactReasonPrediction = useMemo(
        () =>
            Object.values(ticket.custom_fields || {}).find(({prediction}) => {
                return prediction?.display
            }),
        [ticket]
    )

    useEffect(() => {
        if (!contactReasonPrediction?.prediction) return
        const {prediction, hasError, value} = contactReasonPrediction

        if (
            !prediction.confirmed &&
            !prediction.modified &&
            value === prediction.predicted
        )
            return

        // Collapse when dropdown value change
        setIsCollpsed(hasError === undefined)
        setCollapse(true)
    }, [contactReasonPrediction])

    const contactReasonDropdownInputId =
        createInputId(ticket.id, contactReasonPrediction?.id ?? '') + '-input'

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
        if (!isConfirmed) return
        const timer = setTimeout(() => {
            setCollapse(true)
        }, 1500)
        return () => clearTimeout(timer)
    }, [isConfirmed])

    return (
        <div
            className={css.container}
            // Prevents React Virtuoso from complaining about Element been empty @see: https://virtuoso.dev/troubleshooting/#i-get-error-zero-sized-element-this-should-not-happen
            style={
                isCollpsed
                    ? {
                          height: '0px',
                          visibility: 'hidden',
                      }
                    : {}
            }
        >
            <Collapse
                isOpen={!collapse}
                onExited={() => {
                    setIsCollpsed(true)
                    if (isConfirmed) {
                        confirmPrediction()
                    }
                }}
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
        </div>
    )
}
