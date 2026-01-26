import React, { useContext } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { ShopifyContext } from 'Widgets/modules/Shopify/contexts/ShopifyContext'

import { WrappedCustomerMetafields } from './CustomerMetafields'

type CustomerMetafieldsSectionProps = {
    isEditing: boolean
    metafields?: ShopifyMetafield[]
}

export default function CustomerMetafieldsSection({
    isEditing,
    metafields,
}: CustomerMetafieldsSectionProps) {
    const shopifyContext = useContext(ShopifyContext)
    const integrationContext = useContext(IntegrationContext)
    const useSourceMetafields = useFlag(
        FeatureFlagKey.EnableShopifyMetafieldsIngestionUI,
        false,
    )

    return !isEditing ? (
        <WrappedCustomerMetafields
            customerId={shopifyContext.widget_resource_ids.target_id as number}
            integrationId={integrationContext.integrationId as number}
            metafields={metafields}
            useSourceMetafields={useSourceMetafields}
        />
    ) : null
}
