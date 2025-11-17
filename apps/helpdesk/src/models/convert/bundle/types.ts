import type { Components } from 'rest_api/revenue_addon_api/client.generated'

export type Bundle = Components.Schemas.InstallationSchema

export enum BundleStatus {
    Draft = 'draft',
    Installed = 'installed',
    Uninstalled = 'uninstalled',
}

export enum BundleInstallationMethod {
    Manual = 'manual',
    OneClick = '1-click',
    ThemeApp = 'theme_app',
}

export enum BundleInstallationMethodResponse {
    Manual = 'manual',
    OneClick = 'one_click',
    ThemeApp = 'theme_app',
}

export type BundleActionResponse = {
    id: string
    status: BundleStatus
    code: string
}
