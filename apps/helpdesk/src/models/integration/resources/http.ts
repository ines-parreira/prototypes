import client from 'models/api/resources'
import type { ApiListResponseCursorPagination } from 'models/api/types'
import type { HTTPIntegrationEvent } from 'models/integration/types/http'

export async function getHTTPEvents(integrationId: number) {
    const response = await client.get<
        ApiListResponseCursorPagination<HTTPIntegrationEvent[]>
    >(`/api/integrations/${integrationId}/events/`)
    return response
}

export async function getHTTPEvent(integrationId: number, eventId: number) {
    const response = await client.get<HTTPIntegrationEvent>(
        `/api/integrations/${integrationId}/events/${eventId}`,
    )
    return response
}
