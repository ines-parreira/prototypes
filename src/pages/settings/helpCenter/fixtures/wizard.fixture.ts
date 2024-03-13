import {HelpCenterCreationWizardStep} from 'models/helpCenter/types'
import {
    HELP_CENTER_DEFAULT_LAYOUT,
    HELP_CENTER_DEFAULT_LOCALE,
    PlatformType,
} from '../constants'

const HelpCenterApiBaseFixture = {
    id: 1,
    integration_id: null,
    uid: '1',
    code_snippet_template: '<script...></script><div></div>',
    source: 'manual' as any,
    subdomain: 'acme',
    name: 'ACME Help Center',
    deactivated_datetime: null,
    created_datetime: '2021-05-17T18:21:42.022Z',
    updated_datetime: '2021-05-17T18:21:42.022Z',
    deleted_datetime: null,
    default_locale: HELP_CENTER_DEFAULT_LOCALE,
    supported_locales: [HELP_CENTER_DEFAULT_LOCALE],
    search_deactivated_datetime: '2021-05-17T18:21:42.022Z',
    powered_by_deactivated_datetime: null,
    gaid: null,
    algolia_api_key: null,
    algolia_app_id: 'my-algolia-app-id-1',
    algolia_index_name: 'my-algolia-index-1',
    primary_color: '#4A8DF9',
    primary_font_family: 'Inter',
    theme: 'light',
    hotswap_session_token: null,
    self_service_deactivated_datetime: '2021-05-17T18:21:42.022Z',
    shop_name: 'acme',
    email_integration: null,
    automation_settings_id: null,
    account_id: 1,
    type: 'faq' as const,
    layout: 'default' as const,
}

export const InvalidHelpCenterApiFixture = {
    ...HelpCenterApiBaseFixture,
    wizard: {
        platform_type: 'offline',
        step_name: 'offline',
    },
}

export const PartialHelpCenterApiFixture = {
    name: 'ACME Help Center',
    subdomain: 'acme',
    default_locale: HELP_CENTER_DEFAULT_LOCALE,
    wizard: {
        step_data: {
            platform_type: PlatformType.ECOMMERCE,
        },
        step_name: HelpCenterCreationWizardStep.Basics,
    },
    shop_name: 'acme',
    brand_logo_url: null,
    primary_color: '#4A8DF9',
    primary_font_family: 'Inter',
}

export const HelpCenterApiBasicsFixture = {
    ...HelpCenterApiBaseFixture,
    wizard: {
        step_name: HelpCenterCreationWizardStep.Basics,
    },
}

export const HelpCenterApiBrandingFixture = {
    ...HelpCenterApiBaseFixture,
    wizard: {
        step_name: HelpCenterCreationWizardStep.Branding,
    },
}

export const HelpCenterApiArticlesFixture = {
    ...HelpCenterApiBaseFixture,
    wizard: {
        step_name: HelpCenterCreationWizardStep.Articles,
    },
}

export const HelpCenterApiAutomateFixture = {
    ...HelpCenterApiBaseFixture,
    wizard: {
        step_name: HelpCenterCreationWizardStep.Automate,
    },
}

const HelpCenterUiBaseFixture = {
    name: 'ACME Help Center',
    subdomain: 'acme',
    defaultLocale: HELP_CENTER_DEFAULT_LOCALE,
    supportedLocales: [HELP_CENTER_DEFAULT_LOCALE],
    platformType: PlatformType.ECOMMERCE,
    shopName: 'acme',
    brandLogoUrl: null,
    primaryColor: '#4A8DF9',
    primaryFontFamily: 'Inter',
    deactivated: false,
    layout: HELP_CENTER_DEFAULT_LAYOUT,
}

export const HelpCenterUiBasicsFixture = {
    ...HelpCenterUiBaseFixture,
    stepName: HelpCenterCreationWizardStep.Basics,
}

export const HelpCenterUiBrandingFixture = {
    ...HelpCenterUiBaseFixture,
    stepName: HelpCenterCreationWizardStep.Branding,
}

export const HelpCenterUiArticlesFixture = {
    ...HelpCenterUiBaseFixture,
    stepName: HelpCenterCreationWizardStep.Articles,
}

export const HelpCenterUiAutomateFixture = {
    ...HelpCenterUiBaseFixture,
    stepName: HelpCenterCreationWizardStep.Automate,
}

export const EmptyHelpCenterUiFixture = {
    name: '',
    subdomain: '',
    defaultLocale: HELP_CENTER_DEFAULT_LOCALE,
    supportedLocales: [HELP_CENTER_DEFAULT_LOCALE],
    platformType: PlatformType.ECOMMERCE,
    stepName: 'basics',
    shopName: '',
    brandLogoUrl: null,
    primaryColor: '',
    primaryFontFamily: '',
    deactivated: true,
    layout: HELP_CENTER_DEFAULT_LAYOUT,
}

export const InvalidHelpCenterUiFixture = {
    ...HelpCenterUiBaseFixture,
    platformType: 'offline',
    stepName: 'offline',
}
