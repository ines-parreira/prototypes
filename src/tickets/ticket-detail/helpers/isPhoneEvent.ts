import type { Event } from '@gorgias/api-types'

import { PHONE_EVENTS } from 'constants/event'

export function isPhoneEvent(event: Event) {
    return !!event.type && (PHONE_EVENTS as string[]).includes(event.type)
}
