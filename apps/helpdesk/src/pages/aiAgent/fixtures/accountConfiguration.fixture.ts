import type {
    AccountConfiguration,
    AccountConfigurationWithHttpIntegration,
} from 'models/aiAgent/types'

export const getAccountConfigurationFixture = (
    props?: Partial<AccountConfiguration>,
): AccountConfiguration => ({
    accountId: 1,
    gorgiasDomain: 'acme',
    helpdeskOAuth: { accessToken: 'token' },
    customFieldIds: props?.customFieldIds ?? [],
    ...props,
})

export const getAccountConfigurationWithHttpIntegrationFixture = (
    props?: Partial<AccountConfigurationWithHttpIntegration>,
): AccountConfigurationWithHttpIntegration => ({
    accountId: 1,
    gorgiasDomain: 'acme',
    httpIntegration: {
        id: 1,
    },
    helpdeskOAuth: { accessToken: 'token' },
    customFieldIds: props?.customFieldIds ?? [],
    ...props,
})
