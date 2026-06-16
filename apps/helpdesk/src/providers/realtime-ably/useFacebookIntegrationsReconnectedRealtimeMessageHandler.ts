import { useCallback } from 'react'

import { isRecord } from '@repo/utils'

import { toast } from '@gorgias/axiom'
import type { UseChannelProps } from '@gorgias/realtime'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { fetchIntegrations } from 'state/integrations/actions'

import { parseMessageData } from './parseMessageData'

export const FACEBOOK_INTEGRATIONS_RECONNECTED_EVENT =
    'facebook-integrations.reconnected'

type AblyMessage = Parameters<NonNullable<UseChannelProps['onMessage']>>[0]

function getReconnectedPagesTotal(data: unknown): number | undefined {
    if (!isRecord(data)) return undefined

    return typeof data.total === 'number' ? data.total : undefined
}

export function useFacebookIntegrationsReconnectedRealtimeMessageHandler() {
    const dispatch = useAppDispatch()

    const handleFacebookIntegrationsReconnectedRealtimeMessage = useCallback(
        (message: AblyMessage) => {
            const total = getReconnectedPagesTotal(
                parseMessageData(message.data),
            )

            if (total === undefined) return

            dispatch(fetchIntegrations() as any)

            toast.success(
                total === 1
                    ? 'One Facebook page has been reconnected.'
                    : `${total} Facebook pages have been reconnected.`,
            )
        },
        [dispatch],
    )

    return { handleFacebookIntegrationsReconnectedRealtimeMessage }
}
