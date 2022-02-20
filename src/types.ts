import {Map} from 'immutable'

import {RecentChatTicket} from 'business/types/recentChats'
import {User} from 'config/types/user'
import {Plan} from 'models/billing/types'
import {
    IntegrationType,
    IntegrationAuthentication,
    IntegrationExtra,
    Integration,
} from 'models/integration/types'
import {PhoneNumber} from 'models/phoneNumber/types'
import {MacroActionName} from 'models/macroAction/types'
import {Section} from 'models/section/types'
import {View} from 'models/view/types'
import {Account} from 'state/currentAccount/types'
import {Customer} from 'state/customers/types'
import {Tag} from 'state/tags/types'
import {Team} from 'state/teams/types'

export enum ActionTemplateExecution {
    Front = 'front',
    Back = 'back',
}

export type ActionTemplate = {
    execution: ActionTemplateExecution
    name: MacroActionName
    title: string
    notes?: string[]
    integrationType?: string
    arguments?: {
        [key: string]: {
            default: boolean
            display_order: number
            editable: boolean
            input: {
                type: string
            }
            label: string
            type: string
            required: boolean
        }
    }
    validators?: Array<{
        validate: (value: Customer) => unknown | boolean
        error: string
    }>
    partialUpdateKeys: string | string[]
    partialUpdateValues: string
}

export type Attachment = {
    content_type: string
    name: string
    size: number
    url: string
    type: string
}

export type Schemas = Map<any, any>

export type Emoji = {
    colons: string
    emoticons: string[]
    id: string
    name: string
    native: string
    skin: Maybe<string>
    unified: string
}

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
        plans: {
            [key: string]: Plan
        }
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
