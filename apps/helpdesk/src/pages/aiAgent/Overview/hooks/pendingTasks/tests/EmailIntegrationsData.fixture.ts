import type { EmailIntegrationsData } from '../useFetchEmailIntegrationsData'

type AllKeys = keyof EmailIntegrationsDataFixture
type ConfiguredEmailIntegrationsData<
    ToKeepFunctions extends keyof EmailIntegrationsDataFixture,
> = Omit<EmailIntegrationsDataFixture, Exclude<AllKeys, ToKeepFunctions>>

export type EmailIntegrationsDataFullyConfigured =
    ConfiguredEmailIntegrationsData<'build'>

type InternalData = {
    emailIntegrationId: number
}
export class EmailIntegrationsDataFixture {
    private emailIntegrationsData: EmailIntegrationsData
    private internalData: InternalData = {
        emailIntegrationId: 1,
    }

    private constructor() {
        this.emailIntegrationsData = []
    }

    static start() {
        return new EmailIntegrationsDataFixture() as ConfiguredEmailIntegrationsData<
            'withoutEmailIntegrations' | 'withEmailIntegration'
        >
    }

    withoutEmailIntegrations() {
        this.emailIntegrationsData = []
        return this as EmailIntegrationsDataFullyConfigured
    }

    withEmailIntegration({ isDefault = false, isVerified = false } = {}) {
        const id = this.internalData.emailIntegrationId++
        this.emailIntegrationsData.push({
            id,
            isDefault,
            isVerified,
            address: `email-${id}@example.com`,
        } as EmailIntegrationsData[number])

        return this as ConfiguredEmailIntegrationsData<
            'withEmailIntegration' | 'build'
        >
    }

    build(): EmailIntegrationsData {
        return this.emailIntegrationsData
    }
}
