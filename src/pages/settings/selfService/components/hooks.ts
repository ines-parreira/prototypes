import {useEffect, useState} from 'react'
import {Map} from 'immutable'

import {SelfServiceConfiguration} from '../../../../state/self_service/types'
import * as SelfServiceActions from '../../../../state/self_service/actions'

export const useConfigurationData = (params: {
    shopifyIntegrations: Immutable.List<any>
    selfServiceConfigurations: SelfServiceConfiguration[]
    actions: typeof SelfServiceActions
    matchParams: {shopName: string; integrationType: string}
}) => {
    const {
        selfServiceConfigurations,
        shopifyIntegrations,
        actions,
        matchParams: {shopName, integrationType},
    } = params

    const [isLoadingConfig, setIsLoadingConfig] = useState(true)

    useEffect(() => {
        const foundConfigurationIndex = selfServiceConfigurations.findIndex(
            (configuration) =>
                configuration.shop_name ===
                integration.getIn(['meta', 'shop_name'])
        )
        if (foundConfigurationIndex === -1) {
            ;((actions.fetchSelfServiceConfiguration(
                integration.get('id')
            ) as any) as Promise<any>).finally(() => {
                setIsLoadingConfig(false)
            })
        } else {
            setIsLoadingConfig(false)
        }
    }, [])

    const integration: Map<any, any> = shopifyIntegrations.find(
        (shopifyIntegration: Map<any, any>) => {
            return (
                integrationType === shopifyIntegration.get('type') &&
                shopName === shopifyIntegration.getIn(['meta', 'shop_name'])
            )
        }
    )
    const configuration:
        | SelfServiceConfiguration
        | undefined = selfServiceConfigurations.find((configuration) => {
        return (
            configuration.shop_name === integration.getIn(['meta', 'shop_name'])
        )
    })

    return {
        isLoadingConfig,
        configuration,
        integration,
    }
}
