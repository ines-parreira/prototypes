import {Event, EventObjectType, EventType} from 'models/event/types'
import {CursorMeta} from 'models/api/types'

export const events: Event[] = [
    {
        context: 'f8cb5ba6-a235-4353-8900-24a3354beee9',
        created_datetime: '2022-01-25T10:39:21.892050+00:00',
        data: null,
        id: 1,
        object_id: 10,
        object_type: EventObjectType.Ticket,
        type: EventType.TicketCustomerUpdated,
        uri: '/api/events/1/',
        user_id: 1,
    },
    {
        context: '3c3fd1c2-ef5c-4c2e-b56b-3471a04fb21c',
        created_datetime: '2022-01-25T10:39:21.892050+00:00',
        data: null,
        id: 2,
        object_id: 20,
        object_type: EventObjectType.Macro,
        type: EventType.MacroCreated,
        uri: '/api/events/2/',
        user_id: 1,
    },
    {
        context: '4fe8a0b3-7185-40f9-9442-07c291d669c0',
        created_datetime: '2022-01-25T10:39:21.892050+00:00',
        data: null,
        id: 3,
        object_id: 30,
        object_type: EventObjectType.View,
        type: EventType.ViewDeleted,
        uri: '/api/events/3/',
        user_id: 1,
    },
]

export const eventsServerMeta: CursorMeta = {
    next_cursor: 'WyJuZXh0IiwgIjIwMjItMDEtMjRUMTM6MTE6NDQuODEyNzE3IiwgMTEwMF0=',
    prev_cursor: null,
}
