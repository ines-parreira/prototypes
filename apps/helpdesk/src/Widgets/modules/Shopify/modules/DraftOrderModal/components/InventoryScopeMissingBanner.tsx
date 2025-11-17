import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import type { ShopifyIntegration } from 'models/integration/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import {
    getIntegrationByIdAndType,
    makeGetRedirectUri,
} from 'state/integrations/selectors'

type Props = {
    integrationId: number
}

const READ_INVENTORY_ITEMS_SCOPE = 'read_inventory'

export const InventoryScopeMissingBanner = ({ integrationId }: Props) => {
    const isShopifyInventoryItemScopeBannerEnabled = useFlag(
        FeatureFlagKey.ShopifyInventoryItemScopeBanner,
    )
    const getRedirectUri = useAppSelector(makeGetRedirectUri)
    const shopIntegration: ShopifyIntegration | undefined = useAppSelector(
        getIntegrationByIdAndType(integrationId, IntegrationType.Shopify),
    )

    const isMissingInventoryScope =
        shopIntegration?.meta.need_scope_update &&
        !shopIntegration?.meta.oauth.scope.includes(READ_INVENTORY_ITEMS_SCOPE)

    if (!isShopifyInventoryItemScopeBannerEnabled || !isMissingInventoryScope) {
        return null
    }

    const redirectUriTemplate = getRedirectUri(IntegrationType.Shopify)
    const shopName = shopIntegration?.meta.shop_name

    return (
        <div className="mb-4">
            <Alert
                customActions={
                    <div>
                        <a
                            className="mr-3"
                            href={redirectUriTemplate.replace(
                                '{shop_name}',
                                shopName,
                            )}
                        >
                            Update Permissions
                        </a>
                    </div>
                }
                type={AlertType.Warning}
                icon
            >
                The inventory tracking might be outdated. Update Gorgias
                permissions for your Shopify connection <b>{shopName}</b> to fix
                it. Click {'"Update Permissions"'} to proceed.
            </Alert>
        </div>
    )
}

export default InventoryScopeMissingBanner
