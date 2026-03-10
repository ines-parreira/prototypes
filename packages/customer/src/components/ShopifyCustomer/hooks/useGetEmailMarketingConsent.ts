import {
    ObjectType,
    SourceType,
    useGetEcommerceDataByExternalId,
} from '@gorgias/ecommerce-storage-queries'

import type { EmailMarketingConsentData } from '../types'

type Params = {
    integrationId: number | undefined
    externalId: string | undefined
}

export function useGetEmailMarketingConsent({
    integrationId,
    externalId,
}: Params) {
    const isEnabled = !!integrationId && !!externalId

    const {
        data: emailMarketingConsentResponse,
        isLoading: isLoadingEmailMarketingConsent,
    } = useGetEcommerceDataByExternalId(
        ObjectType.EmailMarketingConsent,
        SourceType.Shopify,
        String(integrationId ?? ''),
        externalId ?? '',
        {
            query: {
                enabled: isEnabled,
            },
        },
    )

    const emailMarketingConsent = emailMarketingConsentResponse?.data?.data as
        | EmailMarketingConsentData
        | undefined

    return {
        emailMarketingConsent,
        isLoadingEmailMarketingConsent,
    }
}
