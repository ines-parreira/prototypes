import {
    BigCommerceIntegration,
    IntegrationType,
    Magento2Integration,
    ShopifyIntegration,
} from 'models/integration/types'

import {
    SelfServiceConfiguration,
    SelfServiceConfiguration_DEPRECATED,
    SelfServiceReportIssueCase,
} from './types'

export const selfServiceConfigurationFromDeprecated = (
    configuration: SelfServiceConfiguration_DEPRECATED
): SelfServiceConfiguration => ({
    ...configuration,
    report_issue_policy: {
        ...configuration.report_issue_policy,
        cases: configuration.report_issue_policy.cases.map(
            ({reasons, newReasons, ...rest}): SelfServiceReportIssueCase => ({
                ...rest,
                reasons:
                    newReasons ??
                    reasons.map((reasonKey) => ({
                        reasonKey,
                        action: undefined,
                    })),
            })
        ),
    },
})

export const getShopNameFromStoreIntegration = (
    integration:
        | ShopifyIntegration
        | Magento2Integration
        | BigCommerceIntegration
) => {
    switch (integration.type) {
        case IntegrationType.BigCommerce:
            return integration.meta.store_hash
        case IntegrationType.Magento2:
            return integration.meta.store_url
        case IntegrationType.Shopify:
            return integration.meta.shop_name
    }
}
