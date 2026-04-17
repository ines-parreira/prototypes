import type { DateTimeResultFormatType } from '@repo/utils'
import { formatDatetime } from '@repo/utils'

import type { UserAvailability } from '@gorgias/helpdesk-queries'
import {
    useGetCustomer,
    useGetUserAvailability,
} from '@gorgias/helpdesk-queries'
import type { TicketMessageUserOrCustomer } from '@gorgias/helpdesk-types'

import { useTicketThreadDateTimeFormat } from '../../../../hooks/shared/useTicketThreadDateTimeFormat'

const GORGIAS_CHAT_INTEGRATION_TYPE = 'gorgias_chat'
const ACTIVE_THRESHOLD_SECONDS = 125

type GorgiasChatIntegration = {
    __integration_type__: typeof GORGIAS_CHAT_INTEGRATION_TYPE
    chat_recent_activity_timestamp?: string
}

function isGorgiasChatIntegration(
    integration: Record<string, unknown>,
): integration is GorgiasChatIntegration {
    return integration.__integration_type__ === GORGIAS_CHAT_INTEGRATION_TYPE
}

function getSecondsSince(isoTimestamp: string): number {
    return (Date.now() - new Date(isoTimestamp).getTime()) / 1000
}

export function getLastSeenTooltipText(
    isoTimestamp: string,
    format: DateTimeResultFormatType,
    timezone: string | null | undefined,
): string {
    const diffSeconds = getSecondsSince(isoTimestamp)

    if (diffSeconds < ACTIVE_THRESHOLD_SECONDS) return 'Active now'

    const diffMinutes = diffSeconds / 60
    if (diffMinutes < 59)
        return `Last seen: ${Math.floor(diffMinutes)} minutes ago`

    return `Last seen: ${formatDatetime(isoTimestamp, format, timezone)}`
}

type Params = {
    sender: TicketMessageUserOrCustomer
    fromAgent: boolean
}

type AvatarTooltipResult = {
    tooltipText: string | undefined
    isActive: boolean
}

export function useMessageAvatarTooltip({
    sender,
    fromAgent,
}: Params): AvatarTooltipResult {
    const { format, timezone } = useTicketThreadDateTimeFormat()
    const { data: customerData } = useGetCustomer(sender.id, undefined, {
        query: { enabled: !fromAgent && !!sender.id },
    })
    const { data: availabilityData } = useGetUserAvailability(sender.id, {
        query: { enabled: fromAgent && !!sender.id },
    })

    if (fromAgent) {
        const availability = availabilityData?.data as
            | UserAvailability
            | undefined
        // NOTE: user_status is an explicitly set status, not real-time presence.
        // It persists after logout until the agent manually changes it, so green
        // does not guarantee the agent is currently at their keyboard.
        // This is the only available signal for agent online state in the API.
        const isActive = availability?.user_status === 'available'
        return {
            tooltipText: isActive ? 'Active now' : undefined,
            isActive,
        }
    }

    const rawData = customerData?.data as Record<string, unknown> | undefined
    const integrations = rawData?.integrations as
        | Record<string, Record<string, unknown>>
        | undefined

    const chatIntegration = integrations
        ? Object.values(integrations).find(isGorgiasChatIntegration)
        : undefined

    // NOTE: There is no reliable real-time presence signal for customers.
    // We infer activity by comparing chat_recent_activity_timestamp (updated
    // by the Gorgias Chat widget) against the current time. Customers inactive
    // for more than ACTIVE_THRESHOLD_SECONDS are considered offline. This only
    // applies to Gorgias Chat — email and other channel customers have no
    // presence data and always show grey. This matches the legacy UI behavior.
    const timestamp = chatIntegration?.chat_recent_activity_timestamp

    if (!timestamp) return { tooltipText: undefined, isActive: false }

    return {
        tooltipText: getLastSeenTooltipText(
            timestamp,
            format.relative,
            timezone,
        ),
        isActive: getSecondsSince(timestamp) < ACTIVE_THRESHOLD_SECONDS,
    }
}
