import React, { useContext } from 'react'

import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { ShopifyContext } from 'Widgets/modules/Shopify/contexts/ShopifyContext'

import { WrappedCustomerMetafields } from './CustomerMetafields'

type CustomerMetafieldsSectionProps = {
    isEditing: boolean
}

export default function CustomerMetafieldsSection({
    isEditing,
}: CustomerMetafieldsSectionProps) {
    const shopifyContext = useContext(ShopifyContext)
    const integrationContext = useContext(IntegrationContext)
    return !isEditing ? (
        <WrappedCustomerMetafields
            customerId={shopifyContext.widget_resource_ids.target_id as number}
            integrationId={integrationContext.integrationId as number}
        />
    ) : null
}
