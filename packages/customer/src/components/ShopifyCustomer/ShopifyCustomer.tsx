import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { useParams } from 'react-router-dom'

import { Box } from '@gorgias/axiom'
import { useGetTicket } from '@gorgias/helpdesk-queries'
import { IntegrationType } from '@gorgias/helpdesk-types'

import type { EditShippingAddressModalRenderProps } from './components/CustomerInfo'
import { CustomerInfo } from './components/CustomerInfo'

type CustomerIntegrationData = {
    __integration_type__?: string
    customer?: {
        id?: number
    }
}

type Props = {
    onSyncProfile?: () => void
    renderEditShippingAddressModal?: (
        props: EditShippingAddressModalRenderProps,
    ) => ReactNode
}

export function ShopifyCustomer({
    onSyncProfile,
    renderEditShippingAddressModal,
}: Props) {
    const { ticketId } = useParams<{ ticketId: string }>()
    const { data: ticket, isLoading: isLoadingTicket } = useGetTicket(
        Number(ticketId),
        undefined,
        { query: { enabled: !!ticketId } },
    )

    const customerId = ticket?.data?.customer?.id

    const { associatedShopifyCustomerIds, externalIdMap } = useMemo(() => {
        const integrations = (ticket?.data?.customer?.integrations ??
            {}) as Record<string, CustomerIntegrationData>
        const ids = new Set<number>()
        const map = new Map<number, string>()

        Object.entries(integrations).forEach(([id, integration]) => {
            if (integration.__integration_type__ === IntegrationType.Shopify) {
                const integrationId = Number(id)
                ids.add(integrationId)
                if (integration.customer?.id) {
                    map.set(integrationId, String(integration.customer.id))
                }
            }
        })

        return { associatedShopifyCustomerIds: ids, externalIdMap: map }
    }, [ticket?.data?.customer?.integrations])

    return (
        <Box flexDirection="column" flexGrow={1} minHeight={0}>
            <CustomerInfo
                associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                externalIdMap={externalIdMap}
                isLoadingTicket={isLoadingTicket}
                onSyncProfile={onSyncProfile}
                ticketId={ticketId}
                customerId={customerId}
                renderEditShippingAddressModal={renderEditShippingAddressModal}
            />
        </Box>
    )
}
