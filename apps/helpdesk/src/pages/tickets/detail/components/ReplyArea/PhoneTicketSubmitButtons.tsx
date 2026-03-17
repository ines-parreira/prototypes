import type { SyntheticEvent } from 'react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { isDeviceReady } from '@repo/voice'
import classnames from 'classnames'
import type { Map } from 'immutable'
import parsePhoneNumber from 'libphonenumber-js'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useOutboundCall } from 'hooks/integrations/phone/useOutboundCall'
import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getNewMessageSource } from 'state/newMessage/selectors'
import { DEPRECATED_getTicket } from 'state/ticket/selectors'

import css from './PhoneTicketSubmitButtons.less'

function PhoneTicketSubmitButtons() {
    const agent = useAppSelector(getCurrentUser)
    const source = useAppSelector(getNewMessageSource)
    const ticket = useAppSelector(DEPRECATED_getTicket)

    const { call, device } = useVoiceDevice()

    const agentId = useMemo(() => agent.get('id') as number, [agent])
    const ticketId = useMemo(() => ticket.get('id') as number, [ticket])

    const { isValid, onSubmit } = useSubmit(source, ticketId, agentId)
    const isDisabled = !isDeviceReady(device) || !!call || !isValid

    const handleSubmit = (event: SyntheticEvent) => {
        event.preventDefault()
        onSubmit()
    }

    return (
        <div
            className={classnames(
                css.component,
                'd-flex align-items-center justify-content-between',
            )}
        >
            <Button
                data-testid="outbound-call-button"
                type="submit"
                intent="primary"
                isDisabled={isDisabled}
                onClick={handleSubmit}
            >
                Call
            </Button>
        </div>
    )
}

export default PhoneTicketSubmitButtons

function useSubmit(source: Map<any, any>, ticketId: number, agentId: number) {
    const [fromAddress, setFromAddress] = useState<string>('')
    const [toAddress, setToAddress] = useState<string>('')
    const [customerName, setCustomerName] = useState<string>('')
    const [integrationId, setIntegrationId] = useState<number>(0)
    const [isValid, setIsValid] = useState(false)

    const onCall = useOutboundCall()

    const onSubmit = useCallback(() => {
        onCall({
            fromAddress,
            toAddress,
            integrationId,
            customerName,
            ticketId,
            agentId,
        })
    }, [
        onCall,
        fromAddress,
        toAddress,
        integrationId,
        customerName,
        ticketId,
        agentId,
    ])

    useEffect(() => {
        const newIntegrationId = source.getIn(['from', 'id'])
        const newCustomerName = source.getIn(['to', 0, 'name'])
        const rawFrom = source.getIn(['from', 'address']) || ''
        const rawTo = source.getIn(['to', 0, 'address']) || ''

        const parsedFrom = parsePhoneNumber(rawFrom)
        const parsedTo = parsePhoneNumber(rawTo)

        const formattedFrom = parsedFrom?.format('E.164') || ''
        const formattedTo = parsedTo?.format('E.164') || ''

        setIntegrationId(newIntegrationId)
        setCustomerName(newCustomerName)
        setFromAddress(formattedFrom)
        setToAddress(formattedTo)

        setIsValid(!!newIntegrationId && !!formattedFrom && !!formattedTo)
    }, [source])

    return { isValid, onSubmit }
}
