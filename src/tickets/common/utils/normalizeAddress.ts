import parsePhoneNumber from 'libphonenumber-js'

import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'

import isPhoneBasedSource from './isPhoneBasedSource'

export default function normalizeAddress(
    address: string,
    sourceType:
        | TicketMessageSourceType
        | TicketChannel = TicketMessageSourceType.Email,
): string {
    if (isPhoneBasedSource(sourceType)) {
        const parsedNumber = parsePhoneNumber(address)
        if (parsedNumber) {
            return parsedNumber.format('E.164')
        }
    }
    return address.toLowerCase()
}
