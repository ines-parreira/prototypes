import {Integration, IntegrationType} from 'models/integration/types'

type AllKeys = keyof IntegrationFixture
type ConfiguredIntegrationFixture<
    ToKeepFunctions extends keyof IntegrationFixture,
> = Omit<IntegrationFixture, Exclude<AllKeys, ToKeepFunctions>>

export type IntegrationFixtureFullyConfigured =
    ConfiguredIntegrationFixture<'build'>

export class IntegrationFixture {
    private integration: Integration

    private constructor() {
        this.integration = {meta: {}} as Partial<Integration> as Integration
    }

    static start() {
        return new IntegrationFixture() as ConfiguredIntegrationFixture<'asShopify'>
    }

    asShopify() {
        this.integration.type = IntegrationType.Shopify
        return this as ConfiguredIntegrationFixture<'withDetails'>
    }

    withDetails(details: {id: number; name?: string}) {
        this.integration.id = details.id ?? 1
        this.integration.name = details.name ?? `Integration ${details.id}`

        return this as IntegrationFixtureFullyConfigured
    }

    build(): Integration {
        return this.integration
    }
}
