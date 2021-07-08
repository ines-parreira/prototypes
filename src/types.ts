import {Map} from 'immutable'

import {RecentChatTicket} from './business/types/recentChats'
import {User} from './config/types/user'
import {Plan} from './models/billing/types'
import {
    IntegrationType,
    IntegrationAuthentication,
    IntegrationExtra,
    Integration,
} from './models/integration/types'
import {MacroActionName} from './models/macroAction/types'
import {Section} from './models/section/types'
import {View} from './models/view/types'
import {Account} from './state/currentAccount/types'
import {Customer} from './state/customers/types'
import {Tag} from './state/tags/types'
import {Team} from './state/teams/types'

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
    arguments?: unknown
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
        tickets: RecentChatTicket[]
    }
    currentAccount: Account
    currentUser: User
    integrations: {
        authentication: {
            [K in IntegrationType]: IntegrationAuthentication<K>
        }
        extra: {
            [K in IntegrationType]: IntegrationExtra<K>
        }
        integrations: Integration[]
    }
    schemas: Record<string, unknown>
    tags: {
        items: Tag[]
    }
    teams: {
        all: {
            [key: string]: Team
        }
    }
    views: {
        active: View
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
    }
    integrations: Map<any, any>
    schemas: Map<any, any>
    tags: Map<any, any>
    teams: Map<any, any>
    views: Map<any, any>
}
