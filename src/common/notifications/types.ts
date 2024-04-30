import type {TicketChannel, TicketStatus} from 'business/types/ticket'
import {Actor} from 'models/ticket/types'

export type PickedActor = Pick<Actor, 'id' | 'name' | 'firstname' | 'lastname'>

export type Ticket = {
    id: number
    channel: TicketChannel
    excerpt?: string
    sender: PickedActor
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
          type: 'message-received'
          payload: DefaultPayload
      })
    | (NotificationBase & {
          type: 'snooze-expired'
          payload: DefaultPayload
      })

export type NotificationType = Notification['type']

export type RawNotification = Omit<Notification, 'id'>
