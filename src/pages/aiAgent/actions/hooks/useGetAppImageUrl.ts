import { useMemo } from 'react'

import useApps from 'pages/automate/actionsPlatform/hooks/useApps'

import { ActionAppConfiguration } from '../types'

export default function useGetAppImageUrl(
    actionAppConfiguration?: ActionAppConfiguration,
) {
    const { apps } = useApps()

    return useMemo(() => {
        return apps.find((app) =>
            actionAppConfiguration?.type === 'app'
                ? app.type === 'app' && app.id === actionAppConfiguration.app_id
                : app.type === actionAppConfiguration?.type,
        )?.icon
    }, [actionAppConfiguration, apps])
}
