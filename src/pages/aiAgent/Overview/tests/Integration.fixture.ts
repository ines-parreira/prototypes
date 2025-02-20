import {
    EmailIntegrationMeta,
    GorgiasChatCreationWizardStatus,
    GorgiasChatIntegrationMeta,
    Integration,
    IntegrationType,
} from 'models/integration/types'

type AllKeys = keyof IntegrationFixture
type ConfiguredIntegrationFixture<
    ToKeepFunctions extends keyof IntegrationFixture,
> = Omit<IntegrationFixture, Exclude<AllKeys, ToKeepFunctions>>

export type IntegrationFixtureFullyConfigured =
    ConfiguredIntegrationFixture<'build'>

export type AsEmailArgs = {
    type: IntegrationType.Gmail | IntegrationType.Outlook
    address: string
    isPreferred?: boolean
    isVerified?: boolean
}
export type AsChatArgs = {
    appId?: string
    updatedAt?: string
}
export class IntegrationFixture {
    private integration: Integration

    private constructor() {
        this.integration = {meta: {}} as Partial<Integration> as Integration
    }

    static start() {
        return new IntegrationFixture() as ConfiguredIntegrationFixture<
            'asShopify' | 'asEmail' | 'asChat'
        >
    }

    asShopify() {
        this.integration.type = IntegrationType.Shopify
        return this as ConfiguredIntegrationFixture<'withDetails'>
    }

    asEmail({
        type,
        address,
        isPreferred = true,
        isVerified = true,
    }: AsEmailArgs) {
        this.integration.type = type
        this.integration.meta = {
            address,
            preferred: isPreferred,
            verified: isVerified,
        } as EmailIntegrationMeta
        return this as ConfiguredIntegrationFixture<'withDetails'>
    }

    asChat({appId = 'app_id_123', updatedAt}: AsChatArgs = {}) {
        this.integration.type = IntegrationType.GorgiasChat
        this.integration.meta = {
            app_id: appId,
        } as GorgiasChatIntegrationMeta

        if (updatedAt) {
            this.integration.updated_datetime = updatedAt
        }

        return this as ConfiguredIntegrationFixture<'withDetails'>
    }

    withDetails(details: {
        id: number
        name?: string
        isDraft?: boolean
        storeIntegrationId?: string
    }) {
        this.integration.id = details.id ?? 1
        this.integration.name = details.name ?? `Integration ${details.id}`
        this.integration.meta = {
            ...this.integration.meta,
            wizard: {
                status: details.isDraft
                    ? GorgiasChatCreationWizardStatus.Draft
                    : GorgiasChatCreationWizardStatus.Published,
            },
            shop_integration_id: details.storeIntegrationId,
        }

        return this as IntegrationFixtureFullyConfigured
    }

    build(): Integration {
        return this.integration
    }
}
