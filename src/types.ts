import {Map} from 'immutable'

import {RecentChatTicket} from 'business/types/recentChats'
import {User} from 'config/types/user'
import {
    IntegrationType,
    IntegrationAuthentication,
    IntegrationExtra,
    Integration,
} from 'models/integration/types'
import {PhoneNumber} from 'models/phoneNumber/types'
import {Section} from 'models/section/types'
import {View} from 'models/view/types'
import {Account} from 'state/currentAccount/types'
import {Tag} from 'state/tags/types'
import {Team} from 'state/teams/types'
import {BillingProducts} from 'state/billing/types'

export type Attachment = {
    content_type: string
    name: string
    size: number
    url: string
    type: string
}

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
            [IntegrationType.Facebook]: IntegrationExtra<IntegrationType.Facebook>
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
            [key: string]: {inserted_datetime: string; updated_datetime: string}
        }
    }
    viewSections: {
        [key: string]: Section
    }
    phoneNumbers: PhoneNumber[]
}

export type InitialRootState = {
    agents: Map<any, any>
    billing: Map<any, any>
    chats: Map<any, any>
    currentAccount: Map<any, any>
    currentUSer: Map<any, any>
    entities: {
        sections: {[key: string]: Section}
        tags: {[key: string]: Tag}
        views: {[key: string]: View}
        phoneNumbers: {[key: number]: PhoneNumber}
    }
    integrations: Map<any, any>
    schemas: Map<any, any>
    tags: Map<any, any>
    teams: Map<any, any>
    views: Map<any, any>
}
