export enum RevenueBundleStatus {
    Draft = 'draft',
    Installed = 'installed',
    Uninstalled = 'uninstalled',
}

export enum RevenueBundleInstallationMethod {
    Manual = 'manual',
    OneClick = '1-click',
}

export enum RevenueBundleInstallationMethodResponse {
    Manual = 'manual',
    OneClick = 'one_click',
}

export type RevenueBundle = {
    id: string
    account_id: number
    shop_integration_id: number
    status: RevenueBundleStatus
    created_datetime: string
    deactivated_datetime?: string
    bundle_url?: string
    method?: RevenueBundleInstallationMethodResponse
}

export type RevenueBundleActionResponse = {
    id: string
    status: RevenueBundleStatus
    code: string
}
