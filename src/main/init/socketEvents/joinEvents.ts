import { SocketManager } from 'services/socketManager/socketManager'
import {
    JoinEventType,
    SendEvent,
    SocketEventType,
} from 'services/socketManager/types'

/**
 * Events describing a room to join on server via socket
 */
const joinEvents: SendEvent[] = [
    {
        name: JoinEventType.Ticket,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                dataType: 'Ticket',
                data: parseInt(id as string),
            }
        },
        onLeave: function (id) {
            return (this as unknown as SocketManager).send(
                SocketEventType.AgentTypingStopped,
                id,
            )
        },
    },
    {
        name: JoinEventType.Customer,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                dataType: 'Customer',
                data: parseInt(id as string),
            }
        },
    },
    {
        name: JoinEventType.View,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                dataType: 'View',
                data: parseInt(id as string),
            }
        },
    },
    {
        name: JoinEventType.Integration,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                dataType: 'Integration',
                data: parseInt(id as string),
            }
        },
    },
]

export default joinEvents
