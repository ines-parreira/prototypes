import type { SendEvent } from 'services/socketManager/types'
import { SocketEventType } from 'services/socketManager/types'

/**
 * Events that can be sent to server via socket
 */
const sendEvents: SendEvent[] = [
    {
        name: SocketEventType.TicketViewed,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                event: SocketEventType.TicketViewed,
                dataType: 'Ticket',
                data: parseInt(id as string),
            }
        },
    },
    {
        name: SocketEventType.ViewsCountExpired,
        dataToSend: function (viewIds) {
            return {
                event: SocketEventType.ViewsCountExpired,
                dataType: 'View',
                data: viewIds,
            }
        },
    },
    {
        name: SocketEventType.AgentActive,
        dataToSend: function () {
            return {
                clientId: window.CLIENT_ID,
                event: SocketEventType.AgentActive,
                clientType: 'web',
            }
        },
    },
    {
        name: SocketEventType.AgentInactive,
        dataToSend: function () {
            return {
                clientId: window.CLIENT_ID,
                event: SocketEventType.AgentInactive,
            }
        },
    },
    {
        name: SocketEventType.SidUpdated,
        dataToSend: function () {
            return {
                clientId: window.CLIENT_ID,
                event: SocketEventType.SidUpdated,
            }
        },
    },
    {
        name: SocketEventType.TwilioEventTriggered,
        dataToSend: function (payload) {
            return {
                clientId: window.CLIENT_ID,
                event: SocketEventType.TwilioEventTriggered,
                data: payload,
            }
        },
    },
]

export default sendEvents
