import type { Dispatch, SetStateAction } from 'react'

import type { EditShippingAddressModalRenderProps } from '@repo/customer'
import { ShopifyCustomer, ShopifyCustomerProvider } from '@repo/customer'
import { fromJS } from 'immutable'
import type { Map } from 'immutable'

import { CustomerSyncForm } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/CustomerSyncForm/CustomerSyncForm'
import { CustomerContext } from 'providers/infobar/CustomerContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { DefaultExportDraftOrderModal as DraftOrderModal } from 'Widgets/modules/Shopify/modules/DraftOrderModal'
import { OrderActionsProvider } from 'Widgets/modules/Shopify/modules/Order/components/OrderActionsProvider'
import { OrderSidePanelWithActions } from 'Widgets/modules/Shopify/modules/Order/components/OrderSidePanelWithActions'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import type { useCreateOrder } from '../hooks/useCreateOrder'

type CurrentUser = {
    name: string
    firstname: string
    lastname: string
    email: string
}

type Props = {
    customer: Map<string, unknown>
    customerId: number | null
    currentUser: CurrentUser
    createOrder: ReturnType<typeof useCreateOrder>
    handleSyncProfile: () => void
    renderEditShippingAddressModal: (
        props: EditShippingAddressModalRenderProps,
    ) => React.ReactNode
    isCustomerSyncFormOpen: boolean
    setIsCustomerSyncFormOpen: Dispatch<SetStateAction<boolean>>
}

export function ShopifyInfobarSection({
    customer,
    customerId,
    currentUser,
    createOrder,
    handleSyncProfile,
    renderEditShippingAddressModal,
    isCustomerSyncFormOpen,
    setIsCustomerSyncFormOpen,
}: Props) {
    return (
        <>
            <ShopifyCustomerProvider onCreateOrder={createOrder.open}>
                <OrderActionsProvider ticketCustomerId={customerId}>
                    <ShopifyCustomer
                        onSyncProfile={handleSyncProfile}
                        renderEditShippingAddressModal={
                            renderEditShippingAddressModal
                        }
                        renderOrderSidePanel={(props) => (
                            <OrderSidePanelWithActions {...props} />
                        )}
                        currentUser={currentUser}
                    />
                </OrderActionsProvider>
            </ShopifyCustomerProvider>
            <CustomerSyncForm
                isCustomerSyncFormOpen={isCustomerSyncFormOpen}
                activeCustomer={customer}
                setIsCustomerSyncFormOpen={setIsCustomerSyncFormOpen}
            />
            <CustomerContext.Provider value={{ customerId }}>
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS({}),
                        integrationId: createOrder.data?.integrationId ?? null,
                    }}
                >
                    <DraftOrderModal
                        isOpen={createOrder.isOpen}
                        title="Create order"
                        onChange={createOrder.onChange}
                        onBulkChange={createOrder.onBulkChange}
                        onSubmit={createOrder.onSubmit}
                        onClose={createOrder.onClose}
                        data={{
                            actionName: ShopifyActionType.CreateOrder,
                            customer: createOrder.data?.customerImmutable,
                        }}
                    />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>
        </>
    )
}
