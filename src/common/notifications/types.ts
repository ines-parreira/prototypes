import type {TicketChannel, TicketStatus} from 'business/types/ticket'
import {Actor} from 'models/ticket/types'

export type PickedActor = Pick<Actor, 'id' | 'name' | 'firstname' | 'lastname'>

export type Ticket = {
    id: number
    channel: TicketChannel
    excerpt?: string
    sender?: PickedActor
    status: TicketStatus
    subject: string
}

type NotificationBase = {
    id: string
    inserted_datetime: string
    read_datetime: string | null
    seen_datetime: string | null
}

export type DefaultPayload = {
    ticket: Ticket
}

export type Notification =
    | (NotificationBase & {
          type: 'ticket.snooze-expired'
          payload: DefaultPayload
      })
    | (NotificationBase & {
          type: 'ticket-message.created'
          payload: DefaultPayload
      })
    | (NotificationBase & {
          type: 'user.mentioned'
          payload: {
              sender: PickedActor
              ticket: Ticket
          }
      })

export type NotificationType = Notification['type']

export type RawNotification = UnionOmit<Notification, 'id'>
