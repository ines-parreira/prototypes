import { Map } from 'immutable'

import { Tag } from '@gorgias/helpdesk-queries'

import { RecentChatTicket } from 'business/types/recentChats'
import { User } from 'config/types/user'
import {
    Integration,
    IntegrationAuthentication,
    IntegrationExtra,
    IntegrationType,
} from 'models/integration/types'
import { NewPhoneNumber, OldPhoneNumber } from 'models/phoneNumber/types'
import { Section } from 'models/section/types'
import { Team } from 'models/team/types'
import { View } from 'models/view/types'
import { Application } from 'services/applications'
import { Channel } from 'services/channels'
import { BillingProducts } from 'state/billing/types'
import { Account } from 'state/currentAccount/types'

export type KeysMatching<T, V> = {
    [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T]

export type Schemas = Map<any, any>

export type GorgiasInitialStateRecentChatTicket = Omit<
    RecentChatTicket,
    | 'status'
    | 'assignee_user_id'
    | 'spam'
    | 'trashed_datetime'
    | 'deleted_datetime'
    | 'last_message_body_text'
    | 'last_message_from_agent'
>

export type GorgiasInitialStateTag = Omit<Tag, 'usage'>

export type GorgiasInitialState = {
    agents: {
        all: User[]
    }
    billing: {
        products: BillingProducts
    }
    chats: {
        tickets: GorgiasInitialStateRecentChatTicket[]
    }
    currentAccount: Account
    currentUser: User
    integrations: {
        authentication: Partial<{
            [K in IntegrationType]: IntegrationAuthentication<K>
        }>
        extra: {
            [IntegrationType.GorgiasChat]: IntegrationExtra<IntegrationType.GorgiasChat>
        }
        integrations: Integration[]
    }
    schemas: Record<string, unknown>
    tags: {
        items: GorgiasInitialStateTag[]
    }
    teams: {
        all: {
            [key: string]: Team
        }
    }
    views: {
        active: View | Record<string, unknown>
        counts: {
            [key: string]: number
        }
        items: View[]
        recent?: {
            [key: string]: {
                inserted_datetime: string
                updated_datetime: string
            }
        }
    }
    viewSections: {
        [key: string]: Section
    }
    phoneNumbers: OldPhoneNumber[]
    newPhoneNumbers: NewPhoneNumber[]
}

export type InitialRootState = {
    agents: Map<any, any>
    billing: Map<any, any>
    chats: Map<any, any>
    currentAccount: Map<any, any>
    currentUSer: Map<any, any>
    entities: {
        sections: { [key: string]: Section }
        tags: { [key: string]: Tag }
        views: { [key: string]: View }
        phoneNumbers: { [key: number]: OldPhoneNumber }
        newPhoneNumbers: { [key: number]: NewPhoneNumber }
    }
    integrations: Map<any, any>
    schemas: Map<any, any>
    tags: Map<any, any>
    teams: Map<any, any>
    views: Map<any, any>
}

export type NonEmptyArray<T> = [T, ...T[]]

export type InitialReactQueryState = {
    channels?: Channel[]
    applications?: Application[]
}

export type PolymorphicProps<E extends React.ElementType> =
    React.PropsWithChildren<
        React.ComponentPropsWithoutRef<E> & {
            as?: E
        }
    >
