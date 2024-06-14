import {useMemo} from 'react'
import {useGetApps} from 'models/integration/queries'
import {INTEGRATION_TYPE_CONFIG} from 'config'
import {assetsUrl} from 'utils'
import {ActionApps} from '../types'

export default function useGetAppImageUrl(app?: ActionApps) {
    const {data: appsList} = useGetApps()

    const appImageUrl = useMemo(() => {
        if (app?.type === 'app') {
            return appsList?.find((item) => item.id === app.app_id)?.app_icon
        }
        const integrationConfig = INTEGRATION_TYPE_CONFIG.find(
            (item) => item.type === app?.type
        )
        return integrationConfig?.image
            ? assetsUrl(integrationConfig?.image)
            : undefined
    }, [app, appsList])

    return appImageUrl
}
