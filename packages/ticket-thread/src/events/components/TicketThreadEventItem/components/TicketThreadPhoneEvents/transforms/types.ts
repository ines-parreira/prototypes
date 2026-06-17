import type { TicketThreadPhoneEventItem } from '#events/types'

export type PhoneEventData = TicketThreadPhoneEventItem['data']
export type PhoneEventType = PhoneEventData['type']

export type PhoneEventDetailsEntry = {
    key: string
    value: string
}
