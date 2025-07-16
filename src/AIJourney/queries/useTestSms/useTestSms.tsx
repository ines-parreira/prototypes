import { useMutation } from '@tanstack/react-query'

import {
    CartAbandonedProductApiDTO,
    testJourney,
} from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const testJourneySms = async (
    journeyId: string,
    phoneNumber: string,
    product: CartAbandonedProductApiDTO,
    accessToken: string,
) => {
    return testJourney(
        journeyId,
        { phone_number: phoneNumber, products: [product] },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
            headers: { Authorization: accessToken },
        },
    ).then((res) => res.data)
}

export const useTestSms = () => {
    const accessToken = useAccessToken()
    return useMutation(
        ({
            phoneNumber,
            journeyId,
            product,
        }: {
            phoneNumber: string
            journeyId: string
            product: CartAbandonedProductApiDTO
        }) => {
            if (!accessToken) {
                throw new Error('Access token is required to create a journey')
            }
            return testJourneySms(journeyId, phoneNumber, product, accessToken)
        },
    )
}
