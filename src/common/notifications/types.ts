import type {ChannelType} from '@knocklabs/types'
import type {ComponentType, ReactNode} from 'react'

import type {TicketChannel, TicketStatus} from 'business/types/ticket'
import {Actor} from 'models/ticket/types'
import type {SoundValue} from 'services/NotificationSounds'

import type {ParentProps} from './components/NotificationContent'

export type PickedActor = Pick<Actor, 'id' | 'name' | 'firstname' | 'lastname'>

export type Channel = {
    type: ChannelType
    label: ReactNode
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
    sender?: PickedActor
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

export type RawNotification = UnionOmit<Notification, 'id'>

export type Setting = {
    channels: {[k in ChannelType]?: boolean}
    sound: '' | SoundValue
}

export type Settings = {
    volume: number
    events: {
        [notificationType: string]: Setting
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
    component: ComponentType<{notification: Notification} & ParentProps>
    workflow: string
    settings?: {
        label: string
        icon?: string
        tooltip?: string
    }
}
