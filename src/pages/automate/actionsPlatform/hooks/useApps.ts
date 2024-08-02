import {useMemo} from 'react'

import {useGetApps} from 'models/integration/queries'
import {IntegrationType} from 'models/integration/constants'
import {INTEGRATION_TYPE_CONFIG, IntegrationConfig} from 'config'
import {assetsUrl} from 'utils'

import {App} from '../types'

type NativeAppIntegrationConfig = Omit<IntegrationConfig, 'type' | 'image'> & {
    type: IntegrationType.Shopify | IntegrationType.Recharge
    image: string
}

const NATIVE_APPS_TYPES = [IntegrationType.Shopify, IntegrationType.Recharge]
const NATIVE_APPS: App[] = INTEGRATION_TYPE_CONFIG.filter(
    (integration): integration is NativeAppIntegrationConfig =>
        NATIVE_APPS_TYPES.includes(integration.type)
).map((integration) => ({
    id: integration.type,
    type: integration.type,
    name: integration.title,
    icon: assetsUrl(integration.image),
}))

const useApps = () => {
    const {data = [], isInitialLoading} = useGetApps()

    const apps = useMemo<App[]>(
        () => [
            ...NATIVE_APPS,
            ...data.map((item) => ({
                id: item.id,
                type: IntegrationType.App as const,
                name: item.name,
                icon: item.app_icon,
            })),
        ],
        [data]
    )

    return {isLoading: isInitialLoading, apps}
}

export default useApps
