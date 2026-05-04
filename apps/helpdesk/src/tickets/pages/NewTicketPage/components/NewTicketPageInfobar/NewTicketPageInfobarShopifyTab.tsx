import { CustomerInfo, ShopifyCustomerProvider } from '@repo/customer'

import type { TicketCustomer } from '@gorgias/helpdesk-queries'

import { OrderSidePanelWithActions } from 'Widgets/modules/Shopify/modules/Order/components/OrderSidePanelWithActions'

type CurrentUser = {
    name?: string
    firstname?: string
    lastname?: string
    email?: string
}

type NewTicketPageInfobarShopifyTabProps = {
    customer: TicketCustomer
    associatedShopifyCustomerIds: Set<number>
    externalIdMap: Map<number, string>
    currentUser?: CurrentUser
    onSyncToShopify: (customer: TicketCustomer) => void
}

export function NewTicketPageInfobarShopifyTab({
    customer,
    associatedShopifyCustomerIds,
    externalIdMap,
    currentUser,
    onSyncToShopify,
}: NewTicketPageInfobarShopifyTabProps) {
    return (
        <ShopifyCustomerProvider>
            <CustomerInfo
                associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                externalIdMap={externalIdMap}
                customerId={customer.id}
                onSyncProfile={() => onSyncToShopify(customer)}
                renderOrderSidePanel={(props) => (
                    <OrderSidePanelWithActions {...props} />
                )}
                currentUser={{
                    name: currentUser?.name,
                    firstname: currentUser?.firstname,
                    lastname: currentUser?.lastname,
                    email: currentUser?.email,
                }}
            />
        </ShopifyCustomerProvider>
    )
}
