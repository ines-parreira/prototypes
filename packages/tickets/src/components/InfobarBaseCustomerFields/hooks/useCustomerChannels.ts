import { useMemo } from 'react'

import {
    LegacyChannelSlug,
    TicketMessageSourceType,
} from '@gorgias/helpdesk-queries'
import type { TicketCustomerChannel } from '@gorgias/helpdesk-queries'

const EXCLUDED_CHANNEL_TYPES = [
    TicketMessageSourceType.Chat,
    TicketMessageSourceType.Facebook,
    TicketMessageSourceType.Instagram,
    TicketMessageSourceType.InstagramDirectMessage,
    LegacyChannelSlug.Twitter,
]

type ExcludedChannelType = (typeof EXCLUDED_CHANNEL_TYPES)[number]

function sortChannels(
    channels: TicketCustomerChannel[],
    sortByType: boolean = false,
) {
    return channels.sort((a, b) => {
        // Sort by type first (for otherChannels)
        if (sortByType) {
            const typeDiff = a.type.localeCompare(b.type)
            if (typeDiff !== 0) return typeDiff
        }

        // Sort alphabetically by address
        const addressDiff = (a.address ?? '').localeCompare(b.address ?? '')
        if (addressDiff !== 0) return addressDiff

        // Then by preferred
        return Number(b.preferred) - Number(a.preferred)
    })
}

export function useCustomerChannels(
    channels: TicketCustomerChannel[] | undefined,
) {
    return useMemo(() => {
        if (!channels) {
            return {
                emailChannels: [],
                phoneChannels: [],
                otherChannels: [],
            }
        }

        const emailChannels: TicketCustomerChannel[] = []
        const phoneChannels: TicketCustomerChannel[] = []
        const otherChannels: TicketCustomerChannel[] = []

        // Single-pass iteration
        for (const channel of channels) {
            if (!channel.address) continue
            if (
                EXCLUDED_CHANNEL_TYPES.includes(
                    channel.type as ExcludedChannelType,
                )
            )
                continue

            switch (channel.type) {
                case 'email':
                    emailChannels.push(channel)
                    break
                case 'phone':
                    phoneChannels.push(channel)
                    break
                default:
                    otherChannels.push(channel)
                    break
            }
        }

        return {
            emailChannels: sortChannels(emailChannels),
            phoneChannels: sortChannels(phoneChannels),
            otherChannels: sortChannels(otherChannels, true),
        }
    }, [channels])
}
