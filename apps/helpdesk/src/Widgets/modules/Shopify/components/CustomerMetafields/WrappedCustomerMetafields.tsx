import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import { MetafieldsContainer } from '../../modules/Metafields'
import { CustomerMetafields } from './CustomerMetafields'
import { MetafieldProps } from './types'

export default function WrappedCustomerMetafields(props: MetafieldProps) {
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
            <CustomerMetafields {...props} />
        </MetafieldsContainer>
    )
}
