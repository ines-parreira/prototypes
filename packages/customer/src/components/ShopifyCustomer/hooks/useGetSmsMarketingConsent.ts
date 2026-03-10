import {
    ObjectType,
    SourceType,
    useGetEcommerceDataByExternalId,
} from '@gorgias/ecommerce-storage-queries'

import type { SmsMarketingConsentData } from '../types'

type Params = {
    integrationId: number | undefined
    externalId: string | undefined
}

export function useGetSmsMarketingConsent({
    integrationId,
    externalId,
}: Params) {
    const isEnabled = !!integrationId && !!externalId

    const {
        data: smsMarketingConsentResponse,
        isLoading: isLoadingSmsMarketingConsent,
    } = useGetEcommerceDataByExternalId(
        ObjectType.MarketingConsent,
        SourceType.Shopify,
        String(integrationId ?? ''),
        externalId ?? '',
        {
            query: {
                enabled: isEnabled,
            },
        },
    )

    const smsMarketingConsent = smsMarketingConsentResponse?.data?.data as
        | SmsMarketingConsentData
        | undefined

    return {
        smsMarketingConsent,
        isLoadingSmsMarketingConsent,
    }
}
