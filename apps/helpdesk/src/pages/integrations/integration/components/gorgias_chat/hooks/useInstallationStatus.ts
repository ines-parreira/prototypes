import { useQuery } from '@tanstack/react-query'

import { GorgiasChatMinimumSnippetVersion } from 'models/integration/types'
import { getInstallationStatus } from 'state/integrations/actions'

const FALLBACK: InstallationStatusData = {
    installed: false,
    installedOnShopifyCheckout: false,
    embeddedSpqInstalled: false,
    minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V3,
}

export type InstallationStatusData = {
    installed: boolean
    installedOnShopifyCheckout: boolean
    embeddedSpqInstalled: boolean
    minimumSnippetVersion: GorgiasChatMinimumSnippetVersion | null
}

export const installationStatusQueryKey = (appId: string) => [
    'installationStatus',
    appId,
]

export const useInstallationStatus = (
    appId: string | undefined,
): InstallationStatusData => {
    const { data } = useQuery({
        queryKey: installationStatusQueryKey(appId ?? ''),
        queryFn: () => getInstallationStatus(appId!),
        enabled: Boolean(appId),
        select: (result) => ({
            installed: result.installed,
            installedOnShopifyCheckout: !!result.installedOnShopifyCheckout,
            embeddedSpqInstalled: !!result.embeddedSpqInstalled,
            minimumSnippetVersion: result.minimumSnippetVersion,
        }),
    })

    return data ?? FALLBACK
}
