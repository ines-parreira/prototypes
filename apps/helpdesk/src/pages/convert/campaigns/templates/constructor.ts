import type { Map } from 'immutable'
import moment from 'moment-timezone'

import { INTEGRATION_DATA_ITEM_TYPE_PRODUCT } from 'constants/integration'
import type { Product } from 'constants/integrations/types/shopify'
import client from 'models/api/resources'
import type { DiscountCode } from 'models/discountCodes/types'
import type { IntegrationDataItem } from 'models/integration/types'
import { isProductAvailable } from 'pages/convert/campaigns/utils/checkProductAvailability'
import { transformProductToCampaignAttachment } from 'pages/convert/campaigns/utils/transformProductToCampaignAttachment'
import GorgiasApi from 'services/gorgiasApi'

import type { CampaignConfiguration, CampaignTemplate } from './types'

export class CannotCreateDiscountCode extends Error {
    constructor() {
        super('Cannot create discount code')
    }
}

export class CampaignConfigurationBuilder {
    private readonly data: CampaignConfiguration

    constructor(
        template: CampaignTemplate,
        configuration: CampaignConfiguration,
    ) {
        this.data = {
            ...configuration,
            template_id: template.slug,
        }
    }

    async attachProductCards(
        storeIntegration: Map<string, any>,
        productCount: number,
    ) {
        const gorgiasApi = new GorgiasApi()
        const integrationId = storeIntegration.get('id') as number
        const attachments = (await gorgiasApi.search(
            `/api/integrations/${integrationId}/${INTEGRATION_DATA_ITEM_TYPE_PRODUCT}/`,
            '',
        )) as IntegrationDataItem<Product>[]

        this.data.attachments = attachments
            .filter(
                (product) =>
                    !!product.data?.image?.src &&
                    isProductAvailable(product.data),
            )
            .slice(0, productCount)
            .map((product) => {
                return transformProductToCampaignAttachment(
                    product,
                    storeIntegration,
                )
            })
    }

    static async getOrCreateDiscountCode(
        storeIntegration: Map<string, any>,
        type: 'percentage' | 'fixed' | 'free_shipping',
        code: string,
        value: number,
    ) {
        const integrationId = storeIntegration.get('id') as number

        const listResponse: { data: { data: DiscountCode[] } } =
            await client.get(`/api/discount-codes/${integrationId}/`, {
                params: { search: code },
            })

        const existingCode = listResponse.data.data.find(
            (result) => result.code === code,
        )
        if (!!existingCode) {
            return existingCode.code
        }

        const data = {
            starts_at: moment(),
            discount_type: type,
            title: null,
            code: code,
            discount_value: value,
            once_per_customer: true,
            usage_limit: null,
        }

        try {
            const createResponse: { data: DiscountCode; status: number } =
                await client.post(`/api/discount-codes/${integrationId}/`, data)

            if (createResponse.status !== 201) {
                throw new CannotCreateDiscountCode()
            }

            return createResponse.data.code
        } catch {
            throw new CannotCreateDiscountCode()
        }
    }

    build(): CampaignConfiguration {
        return this.data
    }
}
