import {useMemo} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrations} from 'state/integrations/selectors'
import {ActionApps} from '../types'

type Props = {
    shopName: string
    appType?: ActionApps['type'] | null
}

export default function useGetActionAppIntegration({appType, shopName}: Props) {
    const integrations = useAppSelector(getIntegrations)

    const integration = useMemo(() => {
        if (!appType || !integrations.length) return

        return integrations.find((integration) => {
            if (
                integration.deactivated_datetime ||
                integration.deleted_datetime
            )
                return
            if (appType === 'shopify') {
                return (
                    integration.type === appType &&
                    integration.meta.shop_name === shopName &&
                    integration.meta.oauth.status === 'success'
                )
            }

            if (appType === 'recharge') {
                return (
                    integration.type === appType &&
                    integration.meta.store_name === shopName &&
                    integration.meta.oauth.status === 'success'
                )
            }
        })
    }, [appType, integrations, shopName])

    return integration
}
