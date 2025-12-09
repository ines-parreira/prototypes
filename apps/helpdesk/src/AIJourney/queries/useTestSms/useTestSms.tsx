import { useMutation } from '@tanstack/react-query'

import type { TestProductApiDTO } from '@gorgias/convert-client'
import { testJourney } from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const testJourneySms = async (
    journeyId: string,
    phoneNumber: string,
    product: TestProductApiDTO,
) => {
    return testJourney(
        journeyId,
        { phone_number: phoneNumber, products: [product] },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
        },
    ).then((res) => res.data)
}

export const useTestSms = () => {
    return useMutation(
        ({
            phoneNumber,
            journeyId,
            product,
        }: {
            phoneNumber: string
            journeyId: string
            product: TestProductApiDTO
        }) => {
            return testJourneySms(journeyId, phoneNumber, product)
        },
    )
}
