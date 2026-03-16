import { useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { normalizeMetafields } from '@repo/ecommerce/shopify/components'
import { EditFieldsType, useTicketInfobarNavigation } from '@repo/navigation'
import { useUserDateTimePreferences } from '@repo/preferences'

import { Box } from '@gorgias/axiom'
import { useGetTicket } from '@gorgias/helpdesk-queries'

import { useGetOrderProducts, useIntegrationSelection } from '../../hooks'
import { useGetDraftOrders } from '../../hooks/useGetDraftOrders'
import { useGetEmailMarketingConsent } from '../../hooks/useGetEmailMarketingConsent'
import { useGetOrders } from '../../hooks/useGetOrders'
import { useGetPurchaseSummary } from '../../hooks/useGetPurchaseSummary'
import { useGetShopper } from '../../hooks/useGetShopper'
import { useGetSmsMarketingConsent } from '../../hooks/useGetSmsMarketingConsent'
import { ShopifyCustomerContext } from '../../ShopifyCustomerContext'
import type { OrderEcommerceData } from '../../types'
import { CustomerLink } from '../CustomerLink'
import { StorePicker } from '../StorePicker'
import { createAddressFieldDefinitions } from './addressesFields'
import { CollapsibleFieldSection } from './CollapsibleFieldSection'
import { CustomActions, TemplateResolverProvider } from './CustomActions'
import { CustomerInfoFieldList } from './CustomerInfoFieldList'
import { IntermediateEditPanel } from './IntermediateEditPanel'
import { MetafieldsSection } from './MetafieldsSection'
import { NoShopifyProfile } from './NoShopifyProfile'
import type { EditShippingAddressModalRenderProps } from './OrderSidePanelPreview'
import { OrderSidePanelPreview } from './OrderSidePanelPreview'
import { OrdersList } from './OrdersList'
import type { FieldRenderContext } from './types'
import { useCustomerFieldPreferences } from './useCustomerFieldPreferences'

type Props = {
    associatedShopifyCustomerIds: Set<number>
    externalIdMap: Map<number, string>
    isLoadingTicket?: boolean
    onStoreChange?: (integrationId: number) => void
    onSyncProfile?: () => void
    ticketId?: string
    customerId?: number
    renderEditShippingAddressModal?: (
        props: EditShippingAddressModalRenderProps,
    ) => ReactNode
    currentUser?: {
        name?: string
        firstname?: string
        lastname?: string
        email?: string
    }
}

export function CustomerInfo({
    associatedShopifyCustomerIds,
    externalIdMap,
    isLoadingTicket,
    onStoreChange,
    onSyncProfile,
    ticketId,
    customerId,
    renderEditShippingAddressModal,
    currentUser,
}: Props) {
    const {
        filteredIntegrations,
        selectedIntegration,
        selectedExternalId,
        handleStoreChange,
        isLoading: isLoadingIntegrations,
    } = useIntegrationSelection({
        associatedShopifyCustomerIds,
        externalIdMap,
        onStoreChange,
    })

    const { onCreateOrder, onDuplicateOrder, onRefundOrder, onCancelOrder } =
        useContext(ShopifyCustomerContext)

    const { shopper } = useGetShopper({
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
    })

    const { orders, isLoadingOrders } = useGetOrders({
        integrationId: selectedIntegration?.id,
        shopperIdentityId: shopper?.relationships?.shopper_identity_id,
    })

    const { orders: draftOrders, isLoadingOrders: isLoadingDraftOrders } =
        useGetDraftOrders({
            integrationId: selectedIntegration?.id,
            shopperIdentityId: shopper?.relationships?.shopper_identity_id,
        })

    const { productsMap } = useGetOrderProducts({
        integrationId: selectedIntegration?.id,
        orders: [...(orders ?? []), ...(draftOrders ?? [])],
    })

    const { purchaseSummary } = useGetPurchaseSummary({
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
    })

    const { emailMarketingConsent } = useGetEmailMarketingConsent({
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
    })

    const { smsMarketingConsent } = useGetSmsMarketingConsent({
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
    })

    const { data: ticketData } = useGetTicket(Number(ticketId), undefined, {
        query: { enabled: !!ticketId },
    })

    const enrichedCustomer = useMemo(() => {
        const baseCustomer = (ticketData?.data?.customer ?? {}) as Record<
            string,
            unknown
        >
        const integrationType = selectedIntegration?.type
        if (!integrationType) return baseCustomer

        const existingIntegrations = (baseCustomer.integrations ??
            {}) as Record<string, unknown>

        return {
            ...baseCustomer,
            integrations: {
                ...existingIntegrations,
                [integrationType]: {
                    ...shopper?.data,
                    orders: orders?.map((o) => o.data) ?? [],
                },
            },
        }
    }, [
        ticketData?.data?.customer,
        selectedIntegration?.type,
        shopper?.data,
        orders,
    ])

    const { dateFormat, timeFormat } = useUserDateTimePreferences()

    const context: FieldRenderContext = {
        purchaseSummary,
        shopper,
        dateFormat,
        timeFormat,
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
        customerId,
        ticketId,
        emailMarketingConsent,
        smsMarketingConsent,
    }

    const hasData = !!purchaseSummary || !!shopper

    const { customerFields, sections, preferences, savePreferences } =
        useCustomerFieldPreferences()

    const { editingWidgetType, onSetEditingWidgetType } =
        useTicketInfobarNavigation()

    const allOrders = useMemo(
        () => [...(orders ?? []), ...(draftOrders ?? [])],
        [orders, draftOrders],
    )

    const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(
        null,
    )

    const ordersListIndex = useMemo(() => {
        if (selectedOrderIndex === null) return undefined
        const ordersLength = orders?.length ?? 0
        if (selectedOrderIndex < ordersLength)
            return selectedOrderIndex.toString()
        return undefined
    }, [selectedOrderIndex, orders?.length])

    const selectedOrder =
        selectedOrderIndex !== null
            ? (allOrders[selectedOrderIndex] ?? null)
            : null

    const isDraftOrder =
        draftOrders?.some((order) => order.id === selectedOrder?.id) ?? false

    const handleSelectOrder = useCallback(
        (order: OrderEcommerceData) => {
            const index = allOrders.findIndex((o) => o.id === order.id)
            setSelectedOrderIndex(index !== -1 ? index : null)
        },
        [allOrders],
    )

    const handleNavigatePrevious = useCallback(() => {
        setSelectedOrderIndex((prev) =>
            prev !== null && prev > 0 ? prev - 1 : prev,
        )
    }, [])

    const handleCreateOrder = useCallback(() => {
        if (selectedIntegration?.id && shopper?.data && onCreateOrder) {
            onCreateOrder(selectedIntegration.id, shopper.data)
        }
    }, [selectedIntegration?.id, shopper?.data, onCreateOrder])

    const handleNavigateNext = useCallback(() => {
        setSelectedOrderIndex((prev) =>
            prev !== null && prev < allOrders.length - 1 ? prev + 1 : prev,
        )
    }, [allOrders.length])

    const hasPrevious = selectedOrderIndex !== null && selectedOrderIndex > 0
    const hasNext =
        selectedOrderIndex !== null && selectedOrderIndex < allOrders.length - 1

    const handleDuplicateOrder = useCallback(
        (order: OrderEcommerceData['data']) => {
            if (selectedIntegration?.id && onDuplicateOrder) {
                onDuplicateOrder(selectedIntegration.id, order)
            }
        },
        [selectedIntegration?.id, onDuplicateOrder],
    )

    const handleRefundOrder = useCallback(
        (order: OrderEcommerceData['data']) => {
            if (selectedIntegration?.id && onRefundOrder) {
                onRefundOrder(selectedIntegration.id, order)
            }
        },
        [selectedIntegration?.id, onRefundOrder],
    )

    const handleCancelOrder = useCallback(
        (order: OrderEcommerceData['data']) => {
            if (selectedIntegration?.id && onCancelOrder) {
                onCancelOrder(selectedIntegration.id, order)
            }
        },
        [selectedIntegration?.id, onCancelOrder],
    )

    if (editingWidgetType === EditFieldsType.Shopify) {
        return (
            <IntermediateEditPanel
                customerFields={customerFields}
                context={context}
                preferences={preferences}
                onSavePreferences={savePreferences}
                onClose={() => onSetEditingWidgetType(null)}
            />
        )
    }

    if (
        filteredIntegrations.length === 0 &&
        !isLoadingIntegrations &&
        !isLoadingTicket
    ) {
        return (
            <Box flexDirection="column" gap="sm" padding="sm">
                <NoShopifyProfile onSyncProfile={onSyncProfile ?? (() => {})} />
            </Box>
        )
    }

    return (
        <>
            <div
                style={{
                    flex: 1,
                    overflow: 'auto',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box flexDirection="column" gap="sm" padding="md">
                    <StorePicker
                        integrations={filteredIntegrations}
                        selectedIntegrationId={selectedIntegration?.id}
                        onChange={handleStoreChange}
                        isLoading={isLoadingIntegrations || isLoadingTicket}
                        onSyncProfile={onSyncProfile}
                    />

                    <CustomerLink
                        selectedIntegration={selectedIntegration}
                        shopper={shopper}
                        isLoading={isLoadingIntegrations}
                    />
                    <TemplateResolverProvider
                        ticket={
                            ticketData?.data as
                                | Record<string, unknown>
                                | undefined
                        }
                        customer={
                            enrichedCustomer as
                                | Record<string, unknown>
                                | undefined
                        }
                        currentUser={currentUser}
                        variables={{
                            integrationId: selectedIntegration?.id?.toString(),
                            listIndex: ordersListIndex,
                        }}
                    >
                        <CustomActions
                            integrationId={selectedIntegration?.id}
                            customerId={customerId}
                            ticketId={ticketId}
                        />
                    </TemplateResolverProvider>
                    {hasData && (
                        <>
                            <CustomerInfoFieldList
                                fields={customerFields}
                                context={context}
                            />
                            <MetafieldsSection
                                integrationId={selectedIntegration?.id}
                                metafields={normalizeMetafields(
                                    shopper?.data?.metafields,
                                )}
                                storeName={selectedIntegration?.name}
                            />
                            {sections.map((section) => {
                                if (section.key === 'addresses') {
                                    const addresses =
                                        context.shopper?.data?.addresses ?? []
                                    return addresses.map((_, index) => {
                                        const fieldDefs =
                                            createAddressFieldDefinitions(index)
                                        const fields = section.fields
                                            .map((f) => fieldDefs[f.id])
                                            .filter(Boolean)
                                        return (
                                            <CollapsibleFieldSection
                                                key={`address-${index}`}
                                                label={`Address`}
                                                fields={fields}
                                                context={context}
                                            />
                                        )
                                    })
                                }
                                return (
                                    <CollapsibleFieldSection
                                        key={section.key}
                                        label={section.label}
                                        fields={section.fields}
                                        context={context}
                                    />
                                )
                            })}
                        </>
                    )}
                </Box>

                <OrdersList
                    orders={orders}
                    isLoadingOrders={isLoadingOrders}
                    productsMap={productsMap}
                    draftOrders={draftOrders}
                    isLoadingDraftOrders={isLoadingDraftOrders}
                    onSelectOrder={handleSelectOrder}
                    onCreateOrder={handleCreateOrder}
                />
            </div>

            <OrderSidePanelPreview
                order={selectedOrder?.data ?? null}
                isOpen={selectedOrderIndex !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedOrderIndex(null)
                }}
                productsMap={productsMap}
                isDraftOrder={isDraftOrder}
                onDuplicate={handleDuplicateOrder}
                onRefund={handleRefundOrder}
                onCancel={handleCancelOrder}
                storeName={selectedIntegration?.name}
                integrationId={selectedIntegration?.id}
                ticketId={ticketId}
                customerId={selectedExternalId}
                renderEditShippingAddressModal={renderEditShippingAddressModal}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onNavigatePrevious={
                    allOrders.length > 1 ? handleNavigatePrevious : undefined
                }
                onNavigateNext={
                    allOrders.length > 1 ? handleNavigateNext : undefined
                }
            />
        </>
    )
}
