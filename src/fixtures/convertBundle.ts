import {
    Bundle,
    BundleActionResponse,
    BundleInstallationMethod,
    BundleStatus,
} from 'models/convert/bundle/types'

export const convertBundleId = 'ca920935-acda-48a4-b885-bae77fcada05'

export const convertBundle: Bundle = {
    id: convertBundleId,
    account_id: 1,
    shop_integration_id: 123,
    status: 'installed',
    method: 'one_click',
    config: {},
    created_datetime: '2023-05-19T15:13:28.573231',
    deactivated_datetime: null,
    bundle_url: 'https://test.com/loader.js',
}

export const convertBundleActionResponse: BundleActionResponse = {
    id: convertBundle.id,
    status: BundleStatus.Installed,
    code: '1234',
}

export const installBundleMockImplementation = (
    integrationId: number | null,
    installationMethod: BundleInstallationMethod,
    onSubmit?: (data: BundleActionResponse) => void
) => {
    return {
        installBundle: (): Promise<BundleActionResponse> => {
            const data: BundleActionResponse = {
                id: convertBundle.id,
                status: BundleStatus.Installed,
                code: '1234',
            }
            if (onSubmit) {
                onSubmit(data)
            }

            return Promise.resolve(data)
        },
        isSubmitting: false,
    }
}
