import helpdocsLogo from 'assets/img/integrations/helpdocs.png'
import intercomLogo from 'assets/img/integrations/intercom.png'
import reamazeLogo from 'assets/img/integrations/reamaze.png'
import zendeskLogo from 'assets/img/integrations/zendesk.png'

import type {
    HelpCenterMigrationConfig,
    MigrationProvider,
    MigrationProviderField,
} from '../types'

const properties: MigrationProviderField[] = [
    {
        name: 'email',
        title: 'Email',
        description: 'Your work email',
        format: 'email',
        type: 'string',
    },
    {
        name: 'api_key',
        title: 'API Key',
        description: '****************',
        format: 'password',
        type: 'string',
    },
]

export const migrationProviders: MigrationProvider[] = [
    {
        type: 'HelpDocs',
        title: 'HelpDocs',
        site_url: 'www.helpdocs.io',
        docs_url: 'www.helpdocs.io',
        logo_url: helpdocsLogo,
        properties,
    },
    {
        type: 'Zendesk',
        title: 'Zendesk',
        site_url: 'https://www.zendesk.com/',
        docs_url: 'https://www.zendesk.com/',
        logo_url: zendeskLogo,
        properties,
    },
    {
        type: 'Intercom',
        title: 'Intercom',
        site_url: 'https://www.intercom.com/',
        docs_url: 'https://www.intercom.com/',
        logo_url: intercomLogo,
        properties,
    },
    {
        type: 'Re:amaze',
        title: 'Re:amaze',
        site_url: 'https://www.reamaze.com/',
        docs_url: 'https://www.reamaze.com/',
        logo_url: reamazeLogo,
        properties,
    },
]

export const migrationConfigProviders: string[] = migrationProviders.map(
    (provider) => provider.type,
)
export const helpCenterMigrationConfig: HelpCenterMigrationConfig = {
    providers: migrationConfigProviders,
}
