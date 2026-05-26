import { useContext, useMemo } from 'react'

import { useUserDateTimePreferences } from '@repo/preferences'

import { ObjectType } from '@gorgias/ecommerce-storage-queries'
import { useGetTicket } from '@gorgias/helpdesk-queries'

import {
    useCustomerUpdatedInvalidation,
    useGetOrderProducts,
    useIntegrationSelection,
} from '../../hooks'
import { useGetMarketingConsent } from '../../hooks/useGetMarketingConsent'
import { useGetPurchaseSummary } from '../../hooks/useGetPurchaseSummary'
import { useGetShopper } from '../../hooks/useGetShopper'
import { useListShopifyOrders } from '../../hooks/useListShopifyOrders'
import { ShopifyCustomerContext } from '../../ShopifyCustomerContext'
import type {
    EmailMarketingConsentData,
    SmsMarketingConsentData,
} from '../../types'
import { sortOrdersByDateDesc } from './orders/sortOrders'
import type { FieldRenderContext } from './types'

type Params = {
    associatedShopifyCustomerIds: Set<number>
    externalIdMap: Map<number, string>
    onStoreChange?: (integrationId: number) => void
    ticketId?: string
    customerId?: number
}

export function useCustomerInfoData({
    associatedShopifyCustomerIds,
    externalIdMap,
    onStoreChange,
    ticketId,
    customerId,
}: Params) {
    useCustomerUpdatedInvalidation(customerId)

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

    const { onCreateOrder } = useContext(ShopifyCustomerContext)

    const { shopper, isLoadingShopper } = useGetShopper({
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
    })

    const { orders, isLoadingOrders } = useListShopifyOrders({
        integrationId: selectedIntegration?.id,
        shopperIdentityId: shopper?.relationships?.shopper_identity_id,
        objectType: ObjectType.Order,
    })

    const { orders: draftOrders, isLoadingOrders: isLoadingDraftOrders } =
        useListShopifyOrders({
            integrationId: selectedIntegration?.id,
            shopperIdentityId: shopper?.relationships?.shopper_identity_id,
            objectType: ObjectType.DraftOrder,
        })

    const sortedOrders = useMemo(
        () => (orders ? sortOrdersByDateDesc(orders) : undefined),
        [orders],
    )

    const sortedDraftOrders = useMemo(
        () => (draftOrders ? sortOrdersByDateDesc(draftOrders) : undefined),
        [draftOrders],
    )

    const { productsMap } = useGetOrderProducts({
        integrationId: selectedIntegration?.id,
        orders: [...(sortedOrders ?? []), ...(sortedDraftOrders ?? [])],
    })

    const { purchaseSummary, isLoadingPurchaseSummary } = useGetPurchaseSummary(
        {
            integrationId: selectedIntegration?.id,
            externalId: selectedExternalId,
        },
    )

    const { data: emailMarketingConsent } = useGetMarketingConsent({
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
        objectType: ObjectType.EmailMarketingConsent,
    }) as { data: EmailMarketingConsentData | undefined }

    const { data: smsMarketingConsent } = useGetMarketingConsent({
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
        objectType: ObjectType.MarketingConsent,
    }) as { data: SmsMarketingConsentData | undefined }

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
                    orders: sortedOrders?.map((o) => o.data) ?? [],
                },
            },
        }
    }, [
        ticketData?.data?.customer,
        selectedIntegration?.type,
        shopper?.data,
        sortedOrders,
    ])

    // Enrich the ticket object with type-mapped integration data so that legacy
    // custom-action templates like {{ticket.customer.integrations.shopify.orders[0].name}}
    // continue to resolve in the new UI. The raw ticket API response keys integrations
    // by numeric ID; we add an alias keyed by integration type (e.g. "shopify") that
    // mirrors the same enrichment already applied to `enrichedCustomer`.
    const enrichedTicket = useMemo(() => {
        const ticketRaw = ticketData?.data as
            | Record<string, unknown>
            | undefined
        if (!ticketRaw) return ticketRaw

        const integrationType = selectedIntegration?.type
        if (!integrationType) return ticketRaw

        const ticketCustomer = (ticketRaw.customer ?? {}) as Record<
            string,
            unknown
        >
        const existingIntegrations = (ticketCustomer.integrations ??
            {}) as Record<string, unknown>

        return {
            ...ticketRaw,
            customer: {
                ...ticketCustomer,
                integrations: {
                    ...existingIntegrations,
                    [integrationType]: {
                        ...shopper?.data,
                        orders: sortedOrders?.map((o) => o.data) ?? [],
                    },
                },
            },
        }
    }, [
        ticketData?.data,
        selectedIntegration?.type,
        shopper?.data,
        sortedOrders,
    ])

    const { dateFormat, timeFormat, timezone } = useUserDateTimePreferences()

    const context: FieldRenderContext = {
        purchaseSummary,
        shopper,
        dateFormat,
        timeFormat,
        timezone,
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
        customerId,
        ticketId,
        emailMarketingConsent,
        smsMarketingConsent,
    }

    const hasData = !!purchaseSummary || !!shopper

    return {
        filteredIntegrations,
        selectedIntegration,
        selectedExternalId,
        handleStoreChange,
        isLoadingIntegrations,
        onCreateOrder,
        shopper,
        isLoadingShopper,
        orders: sortedOrders,
        isLoadingOrders,
        draftOrders: sortedDraftOrders,
        isLoadingDraftOrders,
        productsMap,
        purchaseSummary,
        isLoadingPurchaseSummary,
        enrichedCustomer,
        enrichedTicket,
        context,
        hasData,
        ticketData,
        emailMarketingConsent,
        smsMarketingConsent,
        dateFormat,
        timeFormat,
        timezone,
    }
}
