import { BigCommerceIntegration } from 'models/integration/types'
import { getConnectUrl } from 'pages/integrations/integration/components/bigcommerce/Utils'

export const useBigCommerceSettings = (integration: BigCommerceIntegration) => {
    const shopName =
        integration?.meta?.shop_domain?.replace('.mybigcommerce.com', '') ?? ''
    const isActive = !integration?.deactivated_datetime

    const isProductsImportOver =
        integration.meta.import_state?.products.is_over ?? false
    const isCustomersImportOver =
        integration.meta.import_state?.customers.is_over ?? false
    const isExternalOrdersImportOver =
        integration.meta.import_state?.external_orders.is_over ?? false
    const needScopeUpdate = integration?.meta?.need_scope_update ?? false

    const isSyncComplete =
        isProductsImportOver &&
        isCustomersImportOver &&
        isExternalOrdersImportOver

    const retriggerOAuthFlow = () => {
        window.location.href = getConnectUrl()
    }

    return {
        shopName,
        isActive,
        needScopeUpdate,
        isSyncComplete,
        retriggerOAuthFlow,
    }
}
