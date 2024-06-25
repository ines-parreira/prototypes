import {useMemo} from 'react'
import {useGetApps} from 'models/integration/queries'
import {INTEGRATION_TYPE_CONFIG} from 'config'
import {assetsUrl} from 'utils'
import {ActionAppConfiguration} from '../types'

export default function useGetAppImageUrl(
    actionAppConfiguration?: ActionAppConfiguration
) {
    const {data: appsList} = useGetApps()

    const appImageUrl = useMemo(() => {
        if (actionAppConfiguration?.type === 'app') {
            return appsList?.find(
                (item) => item.id === actionAppConfiguration.app_id
            )?.app_icon
        }
        const integrationConfig = INTEGRATION_TYPE_CONFIG.find(
            (item) => item.type === actionAppConfiguration?.type
        )
        return integrationConfig?.image
            ? assetsUrl(integrationConfig?.image)
            : undefined
    }, [actionAppConfiguration, appsList])

    return appImageUrl
}
