import {InstallationStatus} from 'rest_api/gorgias_chat_protected_api/types'

export type ChatInstallationStatusState = Pick<
    InstallationStatus,
    'installed' | 'installedOnShopifyCheckout' | 'minimumSnippetVersion'
>
