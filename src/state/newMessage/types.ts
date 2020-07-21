import type {List, Map} from 'immutable'

import type {Attachment} from '../../types'

export type User = {
    id: string
    email?: string
    name?: string
}

export type NewMessage = {
    id?: string
    source: {
        type: string
        extra: Record<string, unknown>
    }
    channel: string
    sender: User
    body_text: string
    attachments: Attachment[]
    actions: Map<any, any>[]
    public?: boolean
    macros: {id: number}[]
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
