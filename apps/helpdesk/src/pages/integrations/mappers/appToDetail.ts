import type { IntegrationConfig } from 'config'
import type { AppDetail } from 'models/integration/types/app'
import { PricingPlan } from 'models/integration/types/app'
import type { ProductDetail } from 'pages/common/components/ProductDetail/types'

export function mapAppToDetail(
    config: AppDetail | IntegrationConfig,
): ProductDetail {
    return {
        ...config,
        categories: [...config.categories], // avoid keeping the config array ref
        screenshots: [...config.screenshots], // avoid keeping the config array ref
        infocard: {
            pricing: {
                detail:
                    config.pricingPlan === PricingPlan.FREE
                        ? 'Free'
                        : config.pricingDetails ||
                          `Contact ${
                              (config.company && config.company.name) ||
                              'the company'
                          } for pricing details.`,
                link: config.pricingLink,
            },
            resources: {
                documentationLink: config.setupGuide,
                privacyPolicyLink: config.privacyPolicy,
            },
            support: {
                email: config.supportEmail,
                phone: config.supportPhone,
            },
        },
    }
}
