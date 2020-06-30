//@flow
import type {List, Map} from 'immutable'

import type {attachmentType} from '../../types'

export type UserType = {
    id: string,
    email?: string,
    name?: string,
}

export type NewMessageType = {
    id?: string,
    source: {
        type: string,
        extra: {},
    },
    channel: string,
    sender: UserType,
    body_text: string,
    attachments: Array<attachmentType>,
    actions: Array<Map<*, *>>,
    public?: boolean,
    macros: {id: number}[],
}

export type TicketType = {
    state: {},
    _internal: {},
    newMessage: NewMessageType,
    status: string,
    assignee_user: UserType,
    channel: string,
    messages: Array<{}>,
}

export type MacroActionsType = List<Map<*, *>>
