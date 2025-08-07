import type { ComponentType, ReactNode } from 'react'

import type { ChannelType } from '@knocklabs/types'

import type { SoundValue } from 'services/NotificationSounds'

import type { ParentProps } from './components/NotificationContent'

export type Channel = {
    type: ChannelType
    label: ReactNode
}

export type Notification<T = unknown> = {
    id: string
    inserted_datetime: string
    read_datetime: string | null
    seen_datetime: string | null
    type: string
    payload: T
}

export type RawNotification<T = unknown> = UnionOmit<Notification<T>, 'id'>

export type Setting = {
    channels: { [k in ChannelType]?: boolean }
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
    isEnabled?: () => boolean
}

export type NotificationConfig<T = unknown> = {
    type: string
    component: ComponentType<{ notification: Notification<T> } & ParentProps>
    getDesktopNotification?: (notification: Notification<T>) => {
        description?: string
        title: string
    }
    mapType?: (notification: Notification<T>) => string
    workflow: string
    settings?: {
        type: string
        label: string
        icon?: string
        tooltip?: string
    }
    isEnabled?: () => boolean
}
