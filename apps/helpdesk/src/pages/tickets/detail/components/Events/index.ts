import { eventMatcher } from './matcher'
import type { eventMaker, integrationEvent } from './types'

export const getEvent = (eventData: eventMaker): integrationEvent => {
    const emptyEvent = {
        objectLabel: '',
        objectLink: '',
    }

    const { integration } = eventData

    if (integration.isEmpty()) {
        return emptyEvent
    }

    const event = eventMatcher(eventData)

    return event || emptyEvent
}

export default getEvent
