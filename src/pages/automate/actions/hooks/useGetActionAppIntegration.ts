import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getIntegrations} from 'state/integrations/selectors'

import {ActionAppConfiguration} from '../types'

type Props = {
    shopName?: string
    appType?: ActionAppConfiguration['type'] | null
}

const useGetActionAppIntegration = ({appType, shopName}: Props) => {
    const integrations = useAppSelector(getIntegrations)

    return useMemo(() => {
        if (!appType || !integrations.length) {
            return
        }

        return integrations.find((integration) => {
            if (
                integration.deactivated_datetime ||
                integration.deleted_datetime
            ) {
                return
            }

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
}

export default useGetActionAppIntegration
