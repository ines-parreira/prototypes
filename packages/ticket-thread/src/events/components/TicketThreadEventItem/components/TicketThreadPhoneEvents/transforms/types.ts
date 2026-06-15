import type { TicketThreadPhoneEventItem } from '../../../../../types'

export type PhoneEventData = TicketThreadPhoneEventItem['data']
export type PhoneEventType = PhoneEventData['type']

export type PhoneEventDetailsEntry = {
    key: string
    value: string
}
