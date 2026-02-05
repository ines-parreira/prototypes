import { useMutation } from '@tanstack/react-query'

import type { TestProductApiDTO } from '@gorgias/convert-client'
import { testJourney } from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const testJourneySms = async (
    journeyId: string,
    phoneNumber: string,
    products: TestProductApiDTO[],
    returningCustomer?: boolean,
) => {
    return testJourney(
        journeyId,
        {
            phone_number: phoneNumber,
            products,
            returning_customer: returningCustomer,
        },
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
            products,
            returningCustomer,
        }: {
            phoneNumber: string
            journeyId: string
            products: TestProductApiDTO[]
            returningCustomer?: boolean
        }) => {
            return testJourneySms(
                journeyId,
                phoneNumber,
                products,
                returningCustomer,
            )
        },
    )
}
