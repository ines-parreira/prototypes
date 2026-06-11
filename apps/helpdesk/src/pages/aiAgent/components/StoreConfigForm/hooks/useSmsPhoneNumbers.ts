import { useMemo } from 'react'

import { isSessionImpersonated } from '@repo/activity-tracker/utils'

import { useAppSelector } from 'hooks/useAppSelector'
import { getPhoneChannelsForSmsSource } from 'state/integrations/selectors'

import type { SmsPhoneNumber } from '../types'

export function useSmsPhoneNumbers(): SmsPhoneNumber[] {
    const isImpersonated = useMemo(() => isSessionImpersonated(), [])

    const smsPhoneNumbers = useAppSelector(
        getPhoneChannelsForSmsSource,
    ).toJS() as SmsPhoneNumber[]

    const nonMarketingPhoneNumbers = smsPhoneNumbers.filter(
        (phoneNumber) => !phoneNumber.name.startsWith('[MKT]'),
    )

    return isImpersonated ? smsPhoneNumbers : nonMarketingPhoneNumbers
}
