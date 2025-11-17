import { FeatureFlagKey } from '@repo/feature-flags'
import classNames from 'classnames'

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
    className?: string
    shopIntegrationId: number
}

const READ_INVENTORY_ITEMS_SCOPE = 'read_inventory'

export const InventoryScopeMissingBanner = ({
    className: classes,
    shopIntegrationId,
}: Props): JSX.Element => {
    const isShopifyInventoryItemScopeBannerEnabled = useFlag(
        FeatureFlagKey.ShopifyInventoryItemScopeBanner,
    )
    const getRedirectUri = useAppSelector(makeGetRedirectUri)
    const shopIntegration: ShopifyIntegration | undefined = useAppSelector(
        getIntegrationByIdAndType(shopIntegrationId, IntegrationType.Shopify),
    )

    const isMissingInventoryScope =
        shopIntegration?.meta.need_scope_update &&
        !shopIntegration?.meta.oauth.scope.includes(READ_INVENTORY_ITEMS_SCOPE)

    if (!isShopifyInventoryItemScopeBannerEnabled || !isMissingInventoryScope) {
        return <></>
    }

    const redirectUriTemplate = getRedirectUri(IntegrationType.Shopify)
    const shopName = shopIntegration?.meta.shop_name

    return (
        <div className={classNames(classes)}>
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
                Convert needs additional permissions for your Shopify connection{' '}
                <b>{shopName}</b> to function properly. Please update the
                permissions.
            </Alert>
        </div>
    )
}

export default InventoryScopeMissingBanner
