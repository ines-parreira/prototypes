import {IntegrationType, StoreIntegration} from 'models/integration/types'

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
    integration: StoreIntegration
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

export const getShopDomainFromStoreIntegration = (
    integration: StoreIntegration
) => {
    switch (integration.type) {
        case IntegrationType.BigCommerce:
            return integration.meta.shop_domain
        case IntegrationType.Magento2:
            return integration.meta.store_url
        case IntegrationType.Shopify:
            return integration.meta.shop_domain
        default:
            return null
    }
}

export const getShopUrlFromStoreIntegration = (
    integration: StoreIntegration
) => {
    const domain = getShopDomainFromStoreIntegration(integration)

    return domain ? `https://${domain}` : null
}
