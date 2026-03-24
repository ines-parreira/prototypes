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

    const { shopper } = useGetShopper({
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

    const { productsMap } = useGetOrderProducts({
        integrationId: selectedIntegration?.id,
        orders: [...(orders ?? []), ...(draftOrders ?? [])],
    })

    const { purchaseSummary } = useGetPurchaseSummary({
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
    })

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

    return {
        filteredIntegrations,
        selectedIntegration,
        selectedExternalId,
        handleStoreChange,
        isLoadingIntegrations,
        onCreateOrder,
        shopper,
        orders,
        isLoadingOrders,
        draftOrders,
        isLoadingDraftOrders,
        productsMap,
        purchaseSummary,
        enrichedCustomer,
        context,
        hasData,
        ticketData,
        emailMarketingConsent,
        smsMarketingConsent,
        dateFormat,
        timeFormat,
    }
}
