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
    icon?: string
    tooltip?: string
}

export type LegacyEvent = Omit<Event, 'type'> & {
    type: LegacyNotificationType
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

export type EmailDomainPayload = {
    domain: string
}

export type DefaultPayload = {
    ticket: Ticket
    sender: null
}

export type PayloadWithSender = {
    ticket: Ticket
    sender: PickedActor
}

type TicketMessageCreatedType =
    | 'ticket-message.created.email'
    | 'ticket-message.created.chat'
    | 'ticket-message.created.phone'
    | 'ticket-message.created.sms'
    | 'ticket-message.created.facebook'
    | 'ticket-message.created.instagram'
    | 'ticket-message.created.whatsapp'
    | 'ticket-message.created.yotpo'
    | 'ticket-message.created.aircall'
    | 'ticket-message.created'

export type Notification =
    | (NotificationBase & {
          type: 'email-domain.verified'
          payload: EmailDomainPayload
      })
    | (NotificationBase & {
          type: 'ticket.snooze-expired'
          payload: DefaultPayload
      })
    | (NotificationBase & {
          type: 'ticket.assigned'
          payload: DefaultPayload
      })
    | (NotificationBase & {
          type: 'user.mentioned'
          payload: PayloadWithSender
      })
    | (NotificationBase & {
          type: TicketMessageCreatedType
          payload: PayloadWithSender
      })

export type NotificationType = Notification['type']

export type LegacyNotificationType = 'legacy-chat-and-messaging'

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

export type CategoryConfig = {
    type: string
    label: string
    description: string
    typeLabel: string
    notifications?: string[]
}

export type NotificationConfig = {
    type: string
    settings?: {
        label: string
        icon?: string
        tooltip?: string
    }
}

export type Setting = {
    channels: {[k in ChannelType]?: boolean}
    sound: '' | SoundValue
}
