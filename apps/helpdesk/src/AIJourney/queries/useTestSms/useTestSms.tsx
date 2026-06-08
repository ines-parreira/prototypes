import { useMutation } from '@tanstack/react-query'

import type {
    TestJourneyApiDTO,
    TestProductApiDTO,
} from '@gorgias/convert-client'
import { testJourney } from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const testJourneySms = async (
    journeyId: string,
    phoneNumber: string,
    products: TestProductApiDTO[],
    returningCustomer?: boolean,
    testVariantId?: string,
) => {
    const body: TestJourneyApiDTO = {
        phone_number: phoneNumber,
        products,
        returning_customer: returningCustomer,
        ...(testVariantId ? { test_variant_id: testVariantId } : {}),
    }

    return testJourney(journeyId, body, {
        baseURL: getGorgiasRevenueAddonApiBaseUrl(),
    }).then((res) => res.data)
}

export const useTestSms = () => {
    return useMutation(
        ({
            phoneNumber,
            journeyId,
            products,
            returningCustomer,
            testVariantId,
        }: {
            phoneNumber: string
            journeyId: string
            products: TestProductApiDTO[]
            returningCustomer?: boolean
            testVariantId?: string
        }) => {
            return testJourneySms(
                journeyId,
                phoneNumber,
                products,
                returningCustomer,
                testVariantId,
            )
        },
    )
}
