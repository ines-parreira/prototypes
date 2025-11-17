import { getGorgiasSSPApiClient } from 'rest_api/ssp_api/client'

import type { SelfServiceConfiguration } from './types'

export const fetchSelfServiceConfigurationSSP = async (
    shopName: string,
    shopType: string,
): Promise<SelfServiceConfiguration> => {
    const sspClient = await getGorgiasSSPApiClient()

    return sspClient
        .get<SelfServiceConfiguration>(
            `/helpdesk/configurations?shop_name=${shopName}&type=${shopType}`,
        )

        .then(({ data }) => data)
}

export const updateSelfServiceConfigurationSSP = async (
    configuration: SelfServiceConfiguration,
): Promise<SelfServiceConfiguration> => {
    const sspClient = await getGorgiasSSPApiClient()

    return sspClient
        .put<SelfServiceConfiguration>(
            `/helpdesk/configurations?shop_name=${configuration.shopName}&type=${configuration.type}`,
            configuration,
        )
        .then(({ data }) => data)
}
