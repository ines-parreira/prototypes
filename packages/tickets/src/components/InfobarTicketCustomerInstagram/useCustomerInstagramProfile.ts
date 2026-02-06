import { useMemo } from 'react'

import { useExhaustEndpoint } from '@repo/hooks'

import { listIntegrations } from '@gorgias/helpdesk-client'
import { queryKeys, useListInstagramProfiles } from '@gorgias/helpdesk-queries'
import type { TicketCustomer, TicketMessage } from '@gorgias/helpdesk-types'

type UseCustomerInstagramProfileParams = {
    customer: TicketCustomer
    messages: TicketMessage[]
}

export const useCustomerInstagramProfile = ({
    customer,
    messages,
}: UseCustomerInstagramProfileParams) => {
    const queryParams = { limit: 100 }
    const { data: integrations } = useExhaustEndpoint(
        queryKeys.integrations.listIntegrations(queryParams),
        (cursor) => listIntegrations({ cursor, ...queryParams }),
        {
            staleTime: Infinity,
            cacheTime: Infinity,
            refetchOnWindowFocus: false,
        },
    )

    const messageIntegrationId = useMemo(() => {
        if (messages.length === 0) {
            return null
        }

        const lastMessage = messages[messages.length - 1]
        return lastMessage?.integration_id
    }, [messages])

    const instagramId = useMemo(() => {
        if (!messageIntegrationId) {
            return null
        }

        if (!integrations || integrations.length === 0) {
            return null
        }

        const integration = integrations?.find(
            (integration) => integration.id === messageIntegrationId,
        )
        return (integration?.meta as Record<string, any>)?.instagram?.id
    }, [messageIntegrationId, integrations])

    const instagramProfilesParams = {
        customer_id: customer.id ?? 0,
        owning_business_id: instagramId,
        limit: 1,
        order_by: 'updated_at:desc' as const,
    }

    return useListInstagramProfiles(instagramProfilesParams, {
        query: {
            enabled: !!customer.id && !!instagramId,
            queryKey: queryKeys.integrations.listInstagramProfiles(
                instagramProfilesParams,
            ),
            staleTime: Infinity,
            cacheTime: Infinity,
            select: (resp) => resp?.data?.data?.at(0),
        },
    })
}
