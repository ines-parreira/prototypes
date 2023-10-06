import React, {ChangeEvent, useEffect, useRef, useState} from 'react'
import classnames from 'classnames'
import _upperFirst from 'lodash/upperFirst'
import _uniq from 'lodash/uniq'
import _difference from 'lodash/difference'
import _xor from 'lodash/xor'

import {getPersonLabelFromSource} from 'pages/tickets/common/utils'
import {TicketMessageSourceType} from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {SourceAddress} from 'models/ticket/types'
import {RootState} from 'state/types'
import {setReceivers, setSender} from 'state/newMessage/actions'
import {
    getNewMessageType,
    makeGetNewMessageSourceProperty,
    getNewMessageRecipients,
    getContactProperties,
    getOptionalContactProperties,
    areNewMessageContactPropertiesFulfilled as getAreNewMessageContactPropertiesFulfilled,
    isNewMessagePublic,
} from 'state/newMessage/selectors'
import {getChannelsForSourceType} from 'state/integrations/selectors'
import {getTicket} from 'state/ticket/selectors'
import {useOnClickOutside} from 'pages/common/hooks/useOnClickOutside'

import SenderSelectField from './components/SenderSelectField/SenderSelectField'
import ReceiversSelectField from './components/ReceiversSelectField'

import css from './MessageSourceFields.less'

const disabledSources = [
    TicketMessageSourceType.Api,
    TicketMessageSourceType.Chat,
    TicketMessageSourceType.FacebookMessage,
    TicketMessageSourceType.FacebookMessenger,
    TicketMessageSourceType.FacebookPost,
    TicketMessageSourceType.FacebookMentionPost,
    TicketMessageSourceType.InstagramAdComment,
    TicketMessageSourceType.InstagramAdMedia,
    TicketMessageSourceType.InstagramComment,
    TicketMessageSourceType.InstagramMedia,
    TicketMessageSourceType.InstagramDirectMessage, // TODO(check if we need this)
    TicketMessageSourceType.TwitterDirectMessage, // TODO(check if we need this)
]

const LEGACY_SOURCES_THAT_CAN_CHANGE_RECEIVERS = [
    TicketMessageSourceType.Email,
    TicketMessageSourceType.Phone,
    TicketMessageSourceType.Sms,
]

export default function MessageSourceFields() {
    const dispatch = useAppDispatch()
    const sourceType = useAppSelector(getNewMessageType)
    const ticket = useAppSelector(getTicket)
    const isMessagePublic = useAppSelector(isNewMessagePublic)

    const allRecipients = useAppSelector(getNewMessageRecipients)
    const availableContactProperties = useAppSelector(
        getContactProperties(sourceType)
    )
    const getNewMessageSourceProperty = useAppSelector(
        makeGetNewMessageSourceProperty
    )
    const isNewTicket = !ticket?.id
    const areNewMessageContactPropertiesFulfilled = useAppSelector(
        getAreNewMessageContactPropertiesFulfilled as unknown as (
            state: RootState
        ) => boolean
    )
    const optionalContactProperties = useAppSelector(
        getOptionalContactProperties(sourceType)
    )

    const accountChannels = useAppSelector(getChannelsForSourceType(sourceType))

    const [displayedFields, setDisplayedFields] = useState<string[]>([]) // optional fields that are displayed

    const isInputEnabled = !disabledSources.includes(sourceType) || !ticket?.id

    const canChangeReceivers =
        isNewTicket ||
        LEGACY_SOURCES_THAT_CAN_CHANGE_RECEIVERS.includes(sourceType)

    const canOpen = canChangeReceivers

    const [isOpen, setIsOpen] = useState<boolean>(() => {
        if (!canOpen || areNewMessageContactPropertiesFulfilled) {
            return false
        }

        return true
    })

    useEffect(() => {
        if (!canOpen || areNewMessageContactPropertiesFulfilled) {
            setIsOpen(false)
        } else {
            setIsOpen(true)
        }
    }, [areNewMessageContactPropertiesFulfilled, canOpen])

    const containerRef = useRef<HTMLDivElement>(null)
    useOnClickOutside(containerRef, () => {
        if (!isOpen) {
            return
        }

        if (areNewMessageContactPropertiesFulfilled) {
            setIsOpen(false)
        }
    })

    useEffect(() => {
        const hasFromField = displayedFields.includes('from')
        if (isNewTicket && !hasFromField) {
            setDisplayedFields(displayedFields.concat(['from']))
        }
    }, [displayedFields, isNewTicket])

    // if closing or opening, recalculating optional fields that we want to keep open
    useEffect(() => {
        // remove unused fields from optional ones
        const displayedOptionalFields = availableContactProperties.filter(
            (r) => !getNewMessageSourceProperty(r).isEmpty()
        )

        setDisplayedFields(displayedOptionalFields)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    const toggleOptionalField = (field: string) => {
        setDisplayedFields(_xor(displayedFields, [field]))
    }

    // fields that are displayed by default
    const mandatoryFields = availableContactProperties.filter(
        (r) => !optionalContactProperties.includes(r)
    )

    // available optional fields, depends on the fields configuration above (depends on source type or channel)
    const availableOptionalFields = availableContactProperties.filter((r) =>
        optionalContactProperties.includes(r)
    )

    // selected optional fields or fields already containing data
    const displayedOptionalFields = availableOptionalFields.filter((r) => {
        return (
            displayedFields.includes(r) ||
            !getNewMessageSourceProperty(r).isEmpty()
        )
    })

    // remaining optional fields not already displayed
    const remainingOptionalFields = _difference(
        availableOptionalFields,
        displayedOptionalFields
    )

    // final displayed fields
    const finalDisplayedFields = _uniq(
        mandatoryFields.concat(displayedOptionalFields)
    )

    const from = getNewMessageSourceProperty('from').toJS() as SourceAddress

    const allDisplayedNames = (allRecipients.toJS() as SourceAddress[]).map(
        (recipient) => getPersonLabelFromSource(recipient, sourceType)
    )

    if (!isMessagePublic) {
        return (
            <div className={classnames(css.sourceLabel, 'mt-1')}>
                Internal note
            </div>
        )
    }

    return (
        <div
            className={css.component}
            ref={containerRef}
            onClick={() => {
                if (canOpen && !isOpen) {
                    setIsOpen(true)
                }
            }}
        >
            {isOpen ? (
                <>
                    {
                        // display fields
                        finalDisplayedFields.map((prop) => {
                            const newMessageSourceProperty =
                                getNewMessageSourceProperty(prop)
                            const value = newMessageSourceProperty.isEmpty()
                                ? []
                                : newMessageSourceProperty.toJS()

                            return (
                                <div key={prop} className={css.sourceField}>
                                    <span className={css.label}>
                                        {_upperFirst(prop)}:{' '}
                                    </span>
                                    <ReceiversSelectField
                                        sourceType={sourceType}
                                        disabled={!isInputEnabled}
                                        required={mandatoryFields.includes(
                                            prop
                                        )}
                                        value={value}
                                        onChange={(recipients) => {
                                            dispatch(
                                                setReceivers(
                                                    {
                                                        [prop]: recipients,
                                                    },
                                                    false
                                                )
                                            )
                                        }}
                                    />
                                </div>
                            )
                        })
                    }
                    {from && (
                        <div key="from" className={css.sourceField}>
                            <span className={css.label}>From: </span>
                            <SenderSelectField
                                channels={accountChannels}
                                value={from.address}
                                onChange={({
                                    target,
                                }: ChangeEvent<HTMLSelectElement>) => {
                                    dispatch(setSender(target.value))
                                }}
                            />
                        </div>
                    )}
                    {
                        // display buttons for optional fields
                        !!remainingOptionalFields.length && (
                            <div className={css.optionalFields}>
                                {remainingOptionalFields.map((prop, index) => (
                                    <span key={prop}>
                                        <span
                                            className="clickable"
                                            onClick={(e) => {
                                                e.stopPropagation() // prevent the edit window from closing
                                                toggleOptionalField(prop)
                                            }}
                                        >
                                            {_upperFirst(prop)}
                                        </span>
                                        {index <
                                            remainingOptionalFields.length -
                                                1 && ' / '}
                                    </span>
                                ))}
                            </div>
                        )
                    }
                </>
            ) : (
                <div className={css.sourceField}>
                    <span className={css.label}>To: </span>
                    <span
                        className={classnames('mt-1', {
                            clickable: canOpen,
                        })}
                    >
                        {allDisplayedNames.join(', ')}
                    </span>
                </div>
            )}
        </div>
    )
}
