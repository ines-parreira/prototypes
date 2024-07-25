import type {ChannelType} from '@knocklabs/types'
import type {ReactNode} from 'react'

import type {TicketChannel, TicketStatus} from 'business/types/ticket'
import {Actor} from 'models/ticket/types'
import type {SoundValue} from 'services/NotificationSounds'

export type PickedActor = Pick<Actor, 'id' | 'name' | 'firstname' | 'lastname'>

export type Channel = {
    type: ChannelType
    label: ReactNode
}

export type Event = {
    enabled: boolean
    label: ReactNode
    type: NotificationType
}

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

export type PayloadWithSender = {
    ticket: Ticket
    sender: PickedActor
}

export type Notification =
    | (NotificationBase & {
          type: 'ticket.snooze-expired'
          payload: DefaultPayload
      })
    | (NotificationBase & {
          type: 'ticket.assigned'
          payload: DefaultPayload
      })
    | (NotificationBase & {
          type: 'ticket-message.created'
          payload: PayloadWithSender
      })
    | (NotificationBase & {
          type: 'user.mentioned'
          payload: PayloadWithSender
      })

export type NotificationType = Notification['type']

export type RawNotification = UnionOmit<Notification, 'id'>

export type Settings = {
    volume: number
    events: {
        [notificationType: string]: {
            sound: '' | SoundValue
            channels: {[k in ChannelType]?: boolean}
        }
    }
}
