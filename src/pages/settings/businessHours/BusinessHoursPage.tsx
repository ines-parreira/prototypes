import React from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import BusinessHours from './BusinessHours'
import CustomBusinessHours from './CustomBusinessHours'

export default function BusinessHoursPage() {
    const isCBHEnabled = useFlag(FeatureFlagKey.CustomBusinessHours)

    return (
        <BusinessHours>{isCBHEnabled && <CustomBusinessHours />}</BusinessHours>
    )
}
