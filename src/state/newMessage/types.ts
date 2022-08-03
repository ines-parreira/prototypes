import {List, Map} from 'immutable'
import {ContentState, SelectionState} from 'draft-js'

import {TicketMessageSourceType} from '../../business/types/ticket'
import {Macro} from '../../models/macro/types'
import {MacroAction} from '../../models/macroAction/types'
import {Attachment} from '../../types'

export enum ReceiverProperty {
    To = 'to',
    Cc = 'cc',
    Bcc = 'bcc',
}

export type User = {
    id: string
    email?: string
    name?: string
}

type Address = {
    address: string
    name: string
}

export type NewMessage = {
    id?: string
    source: {
        type: string
        extra: Record<string, unknown>
        from?: Record<string, unknown>
        to?: Record<string, unknown>
    }
    channel: string
    sender: User
    body_text: string
    body_html: string
    stripped_text?: string
    stripped_html?: string
    attachments: Attachment[]
    actions: List<Map<any, any>>
    public?: boolean
    macros: {id: number}[]
}

export type ReplyAreaState = {
    dirty: boolean
    emailExtraAdded: boolean
    cacheAdded: boolean
    forceUpdate: boolean
    forceFocus: boolean
    contentState: ContentState
    selectionState: SelectionState | null
    appliedMacro: Map<any, any> | null
    firstNewMessage: boolean
}

export type Ticket = {
    state: Record<string, unknown>
    _internal: Record<string, unknown>
    newMessage: NewMessage
    status: string
    assignee_user: User
    channel: string
    messages: Record<string, unknown>[]
}

export type MacroActions = List<Map<any, any>>

type MessageSource = {
    extra: Record<string, unknown>
    from: Address
    to: Address[]
    type: TicketMessageSourceType
}

export type Message = {
    actions: Maybe<MacroAction[]>
    attachements: Attachment[]
    body_html: string
    body_text: string
    channel: TicketMessageSourceType
    created_datetime: string
    deleted_datetime: Maybe<string>
    external_id: Maybe<string>
    failed_datetime: Maybe<string>
    from_agent: boolean
    headers: Maybe<Record<string, unknown>>
    id: number
    integration_id: Maybe<number>
    last_sending_error: Maybe<string>
    macros: Macro[]
    message_id: Maybe<number>
    meta: Maybe<Record<string, unknown>>
    opened_datetime: Maybe<string>
    public: boolean
    receiver: User
    rule_id: Maybe<number>
    sender: User
    sent_datetime: Maybe<string>
    source: MessageSource
    stripped_html: Maybe<string>
    stripped_signature: Maybe<string>
    stripped_text: Maybe<string>
    subject: Maybe<string>
    ticket_id: number
    uri: string
    via: string
}

export type NewMessageState = Map<any, any>
