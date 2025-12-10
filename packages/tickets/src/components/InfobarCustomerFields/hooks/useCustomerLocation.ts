import type { TicketCustomer } from '@gorgias/helpdesk-types'

type CustomerMeta = {
    location_info?: {
        city?: string
        country_name?: string
        time_zone?: {
            offset?: string
        }
    }
}

export function useCustomerLocation(customer: TicketCustomer | undefined) {
    const locationInfo = (customer?.meta as CustomerMeta | undefined)
        ?.location_info

    const city = locationInfo?.city
    const country = locationInfo?.country_name
    const location = city && country ? `${city}, ${country}` : city || country

    return {
        location,
        timezoneOffset: locationInfo?.time_zone?.offset,
    }
}
