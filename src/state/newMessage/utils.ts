import {TicketMessageSourceType} from 'business/types/ticket'
import {MacroActionName} from 'models/macroAction/types'
import {EMPTY_SENDER} from 'state/ticket/constants'
import {MacroActions, NewMessage} from './types'

export function transformToInternalNote(
    message: NewMessage,
    actions?: MacroActions | null,
    placeholder = ''
) {
    let newActions
    const newMessage = {
        ...message,
        source: {
            ...message.source,
            type: TicketMessageSourceType.InternalNote,
            from: EMPTY_SENDER,
        },
    }
    delete newMessage.source.to
    const internalNote = actions?.find(
        (action) => action?.get('name') === MacroActionName.AddInternalNote
    )
    if (internalNote) {
        const args = internalNote.get('arguments') as Map<any, any>
        newMessage.body_text = args.get('body_text') ?? ''
        newMessage.body_html = args.get('body_html') ?? ''
        newActions = actions?.filter(
            (action) => action?.get('name') !== MacroActionName.AddInternalNote
        ) as MacroActions | undefined
    } else {
        newMessage.body_text = placeholder
        newMessage.body_html = `<div>${placeholder}</div>`
        newActions = actions
    }

    newMessage.public = false
    return {newMessage, newActions}
}
