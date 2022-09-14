import {useEffect, useState} from 'react'
import {Map} from 'immutable'
import {useParams} from 'react-router-dom'

import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {fetchSelfServiceConfiguration} from 'models/selfServiceConfiguration/resources'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {DEPRECATED_getIntegrationsByTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/types'
import {getSelfServiceConfigurations} from 'state/entities/selfServiceConfigurations/selectors'
import {selfServiceConfigurationFetched} from 'state/entities/selfServiceConfigurations/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const useConfigurationData = () => {
    const dispatch = useAppDispatch()
    const {shopName, integrationType} = useParams<{
        shopName: string
        integrationType: string
    }>()
    const shopifyIntegrations = useAppSelector(
        DEPRECATED_getIntegrationsByTypes(IntegrationType.Shopify)
    )
    const selfServiceIntegrations = useAppSelector(
        DEPRECATED_getIntegrationsByTypes(IntegrationType.SelfService)
    )
    const selfServiceConfigurations = useAppSelector(
        getSelfServiceConfigurations
    )

    const [isLoadingConfig, setIsLoadingConfig] = useState(true)

    useEffect(() => {
        const foundConfigurationIndex = selfServiceConfigurations.findIndex(
            (configuration) =>
                configuration.shop_name ===
                shopifyIntegration.getIn(['meta', 'shop_name'])
        )

        if (foundConfigurationIndex === -1) {
            void (async () => {
                try {
                    const res = await fetchSelfServiceConfiguration(
                        shopifyIntegration.get('id')
                    )
                    void dispatch(selfServiceConfigurationFetched(res))
                    setIsLoadingConfig(false)
                } catch (error) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message:
                                'Could not fetch the Self-service configuration, please try again later.',
                        })
                    )
                } finally {
                    setIsLoadingConfig(false)
                }
            })()
        } else {
            setIsLoadingConfig(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const shopifyIntegration: Map<any, any> = shopifyIntegrations.find(
        (shopifyIntegration: Map<any, any>) => {
            return (
                integrationType === shopifyIntegration.get('type') &&
                shopName === shopifyIntegration.getIn(['meta', 'shop_name'])
            )
        }
    )

    const configuration: SelfServiceConfiguration | undefined =
        selfServiceConfigurations.find((configuration) => {
            return (
                configuration.shop_name ===
                shopifyIntegration.getIn(['meta', 'shop_name'])
            )
        })

    const selfServiceIntegration: Map<any, any> = selfServiceIntegrations.find(
        (integration: Map<any, any>) => {
            return (
                integration.getIn(['meta', 'shop_name']) ===
                shopifyIntegration.getIn(['meta', 'shop_name'])
            )
        }
    )

    return {
        isLoadingConfig,
        configuration,
        integration: shopifyIntegration,
        selfServiceIntegration,
    }
}
