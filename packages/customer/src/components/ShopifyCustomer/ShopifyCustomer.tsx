import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { useParams } from 'react-router-dom'

import { Box } from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-queries'
import { useGetTicket } from '@gorgias/helpdesk-queries'

import { useGetCustomer } from '../../hooks/useGetCustomer'
import type {
    EditShippingAddressModalRenderProps,
    OrderSidePanelRenderProps,
} from './components/CustomerInfo'
import { CustomerInfo } from './components/CustomerInfo'
import { getShopifyCustomerAssociations } from './utils/getShopifyCustomerAssociations'

type Props = {
    onSyncProfile?: () => void
    renderEditShippingAddressModal?: (
        props: EditShippingAddressModalRenderProps,
    ) => ReactNode
    renderOrderSidePanel: (props: OrderSidePanelRenderProps) => ReactNode
    currentUser?: {
        name?: string
        firstname?: string
        lastname?: string
        email?: string
    }
}

export function ShopifyCustomer({
    onSyncProfile,
    renderEditShippingAddressModal,
    renderOrderSidePanel,
    currentUser,
}: Props) {
    const { ticketId } = useParams<{ ticketId: string }>()
    const { data: ticket, isLoading: isLoadingTicket } = useGetTicket(
        Number(ticketId),
        undefined,
        { query: { enabled: !!ticketId } },
    )

    const customerId = ticket?.data?.customer?.id

    const { data: customer, isLoading: isLoadingCustomer } = useGetCustomer(
        customerId ?? 0,
        undefined,
        { query: { enabled: !!customerId } },
    )

    const { associatedShopifyCustomerIds, externalIdMap } = useMemo(
        () =>
            getShopifyCustomerAssociations(
                (customer?.data as TicketCustomer | undefined) ?? null,
            ),
        [customer?.data],
    )

    return (
        <Box flexDirection="column" flexGrow={1} minHeight={0}>
            <CustomerInfo
                associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                externalIdMap={externalIdMap}
                isLoadingTicket={isLoadingTicket || isLoadingCustomer}
                onSyncProfile={onSyncProfile}
                ticketId={ticketId}
                customerId={customerId}
                renderEditShippingAddressModal={renderEditShippingAddressModal}
                renderOrderSidePanel={renderOrderSidePanel}
                currentUser={currentUser}
            />
        </Box>
    )
}
