import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'

import { MetafieldsContainer } from '../../modules/Metafields'
import { CustomerMetafields } from './CustomerMetafields'
import type { MetafieldProps } from './types'

export default function WrappedCustomerMetafields({
    integrationId,
    customerId,
    metafields,
    useSourceMetafields,
}: MetafieldProps) {
    const showCustomerMetafields = useFlag(
        FeatureFlagKey.ShowShopifyCustomerMetafields,
        false,
    )

    if (!showCustomerMetafields) {
        return null
    }

    const onOpened = () => {
        logEvent(SegmentEvent.ShopifyMetafieldsOpenCustomer)
    }

    return (
        <MetafieldsContainer onOpened={onOpened} title="Customer Metafields">
            <CustomerMetafields
                integrationId={integrationId}
                customerId={customerId}
                metafields={metafields}
                useSourceMetafields={useSourceMetafields}
            />
        </MetafieldsContainer>
    )
}
