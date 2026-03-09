import { useMemo } from 'react'

import { useUserDateTimePreferences } from '@repo/preferences'
import {
    DateAndTimeFormatting,
    getDateAndTimeFormat,
    getLocalTime,
} from '@repo/utils'

import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { useCustomerLocation } from './useCustomerLocation'

export function useCustomerLocalTime(customer?: TicketCustomer) {
    const { dateFormat, timeFormat } = useUserDateTimePreferences()
    const { timezoneOffset } = useCustomerLocation(customer)

    const localTime = useMemo(
        () =>
            timezoneOffset
                ? getLocalTime(
                      timezoneOffset,
                      getDateAndTimeFormat(
                          dateFormat,
                          timeFormat,
                          DateAndTimeFormatting.TimeDoubleDigitHour,
                      ),
                  )
                : null,
        [timezoneOffset, dateFormat, timeFormat],
    )

    return localTime
}
