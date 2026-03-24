import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { PhoneCountry } from 'business/twilio'

export function useShowPhoneUseCase(country?: PhoneCountry): boolean {
    const isMarketingPhoneNumberEnabled = useFlag(
        FeatureFlagKey.MarketingPhoneNumber,
    )
    return (
        isMarketingPhoneNumberEnabled &&
        (country === PhoneCountry.US || country === PhoneCountry.CA)
    )
}
