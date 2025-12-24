import { parsePhoneNumber } from 'libphonenumber-js'
import { isNumber } from 'lodash'
import { useHistory, useParams } from 'react-router-dom'

import { IconName, MenuItem, SubMenu } from '@gorgias/axiom'
import type { PhoneIntegration, SmsIntegration } from '@gorgias/helpdesk-types'

import { useCurrentUserId } from '../../../hooks/useCurrentUserId'
import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge/useTicketsLegacyBridge'
import { formatPhoneNumberInternational } from '../../../utils/validation'

type VoiceFieldMenuItemsProps = {
    phoneAddress: string
    customerId: string
    customerName: string
    phoneIntegrations: PhoneIntegration[]
    smsIntegrations: SmsIntegration[]
    phoneNumbers: Record<
        number,
        { phone_number: string; phone_number_friendly: string }
    >
    isLoading: boolean
}

export function VoiceFieldMenuItems({
    phoneAddress,
    customerId,
    customerName,
    phoneIntegrations,
    smsIntegrations,
    phoneNumbers,
    isLoading,
}: VoiceFieldMenuItemsProps) {
    const history = useHistory()
    const { makeOutboundCall, voiceDevice } = useTicketsLegacyBridge()
    const { device, call } = voiceDevice
    const isVoiceDisabled = !device || !!call

    const { currentUserId } = useCurrentUserId()

    const { ticketId: ticketIdParam } = useParams<{ ticketId?: string }>()

    const ticketId =
        ticketIdParam && ticketIdParam !== 'new'
            ? parseInt(ticketIdParam, 10)
            : null

    const toAddress = parsePhoneNumber(phoneAddress)?.format('E.164') || ''

    if (
        phoneIntegrations.length === 0 &&
        smsIntegrations.length === 0 &&
        !isLoading
    ) {
        const href = phoneAddress.replace(/[. ]/g, '')
        const formattedNumber = formatPhoneNumberInternational(phoneAddress)
        return (
            <MenuItem
                label={`Call ${formattedNumber}`}
                leadingSlot={IconName.CommPhone}
                onAction={() => {
                    window.location.href = `tel:${href}`
                }}
            />
        )
    }

    return (
        <>
            {phoneIntegrations.length > 0 && isNumber(currentUserId) && (
                <SubMenu
                    label="Make outbound call"
                    leadingSlot={IconName.CommPhone}
                    maxHeight={212}
                    maxWidth={144}
                >
                    <MenuItem label="Call via" isDisabled />
                    {phoneIntegrations.map((integration) => {
                        const meta = integration.meta
                        const phoneNumberId = meta.phone_number_id
                        if (!phoneNumberId) {
                            return null
                        }

                        const phoneNumber = phoneNumbers[phoneNumberId]
                        if (!phoneNumber) {
                            return null
                        }

                        const isDisabled = isVoiceDisabled || !toAddress
                        const emoji = meta.emoji
                        const label = `${emoji ? `${emoji} ` : ''}${integration.name}`

                        return (
                            <MenuItem
                                key={integration.id}
                                label={label}
                                caption={`[${phoneNumber.phone_number_friendly}]`}
                                onAction={() => {
                                    if (isDisabled) return

                                    makeOutboundCall({
                                        fromAddress: phoneNumber.phone_number,
                                        toAddress,
                                        integrationId: integration.id,
                                        customerName,
                                        ticketId,
                                        agentId: currentUserId,
                                    })
                                }}
                                isDisabled={isDisabled}
                            />
                        )
                    })}
                </SubMenu>
            )}
            {smsIntegrations.length > 0 && (
                <SubMenu
                    label="Send SMS"
                    leadingSlot={IconName.CommChatDots}
                    maxHeight={212}
                    maxWidth={144}
                >
                    <MenuItem label="Send SMS via" isDisabled />
                    {smsIntegrations.map((integration) => {
                        const meta = integration.meta
                        const phoneNumberId = meta.phone_number_id
                        if (!phoneNumberId) {
                            return null
                        }

                        const phoneNumber =
                            phoneNumbers[phoneNumberId as number]
                        if (!phoneNumber) {
                            return null
                        }

                        const emoji = meta.emoji
                        const label = `${emoji ? `${emoji} ` : ''}${integration.name}`

                        return (
                            <MenuItem
                                key={integration.id}
                                label={label}
                                caption={`[${phoneNumber.phone_number_friendly}]`}
                                onAction={() => {
                                    history.push({
                                        pathname: '/app/ticket/new',
                                        search: `?customer=${customerId}`,
                                        state: {
                                            source: 'sms',
                                            sender: phoneNumber.phone_number,
                                            receiver: {
                                                name: customerName,
                                                address: toAddress,
                                            },
                                            _navigationKey: Date.now(),
                                        },
                                    })
                                }}
                            />
                        )
                    })}
                </SubMenu>
            )}
        </>
    )
}
