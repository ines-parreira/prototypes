import {convertToRaw, ContentState} from 'draft-js'
import {fromJS, Map, List} from 'immutable'
import _forOwn from 'lodash/forOwn'
import _get from 'lodash/get'

import {omit} from 'lodash'
import {TicketMessageSourceType} from 'business/types/ticket'
import {canLeaveInternalNote} from 'config/ticket'
import {MacroAction, MacroActionName} from 'models/macroAction/types'
import {EMPTY_SENDER} from 'state/ticket/constants'
import {ApplyExternalTemplateAction} from 'models/whatsAppMessageTemplates/types'
import {
    WhatsAppMessageTemplateToHtml,
    WHATSAPP_VARIABLE_REGEX,
} from 'pages/integrations/integration/components/whatsapp/utils'
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

export function getMentionIds(
    contentState: ContentState,
    sourceType: TicketMessageSourceType
) {
    let ids: List<any> = fromJS([])
    const isInternalNote = canLeaveInternalNote(sourceType)

    if (contentState && isInternalNote) {
        const entityMap = convertToRaw(contentState).entityMap
        _forOwn(entityMap, (entity) => {
            if (entity.type === 'mention') {
                // don't push duplicate ids
                const id = _get(entity.data.mention, 'id')
                if (!ids.includes(id)) {
                    ids = ids.push(id)
                }
            }
        })
    }

    return ids
}

export const replaceWhatsAppTemplateVariables = (
    text: string,
    args: {
        type: string
        value: string
    }[]
): string => {
    let newText = text

    for (let i = 1; i <= args.length; i++) {
        const variableRegex = new RegExp(WHATSAPP_VARIABLE_REGEX, 'g')
        newText.match(variableRegex)?.forEach((match) => {
            // Remove the "{{" and "}}" and parse as an integer
            const number = match.slice(2, -2)
            newText = newText.replace(match, args[+number - 1].value)
        })
    }

    return WhatsAppMessageTemplateToHtml(newText)
}

export const transformExternalTemplatePart = (
    text: string,
    args: {
        type: string
        value: string
    }[]
): string => {
    const lines = text.split('\n')

    const newLines = lines.map((line) =>
        replaceWhatsAppTemplateVariables(line, args)
    )

    return newLines.join('<br/>')
}

export function upsertNewMessageAction(
    message: NewMessage,
    action: Map<any, any>
): NewMessage {
    const newMessage = {...message}

    if (!newMessage.actions) {
        newMessage.actions = fromJS([action])
        return newMessage
    }

    const existingActionIndex = newMessage.actions.findIndex(
        (existingAction?: Map<any, any>) =>
            existingAction?.get('name') === action.get('name')
    )
    if (existingActionIndex !== -1) {
        newMessage.actions = newMessage.actions.set(existingActionIndex, action)
        return newMessage
    }

    newMessage.actions = newMessage.actions.push(action)

    return newMessage
}

export const applyExternalTemplateAction = (
    newMessage: NewMessage
): NewMessage => {
    const actions = newMessage.actions?.toJS() as MacroAction[]

    const action = actions?.find(
        (action) => action.name === MacroActionName.ApplyExternalTemplate
    ) as ApplyExternalTemplateAction | undefined

    if (!action?.arguments.template) {
        return newMessage
    }

    const {template, body: bodyArgs} = action.arguments
    const {body: templateBody} = template.components

    const body_html = transformExternalTemplatePart(
        templateBody.value,
        bodyArgs
    )

    const message = upsertNewMessageAction(
        newMessage,
        fromJS(omit(action, ['arguments.template']))
    )

    return {
        ...message,
        body_html,
    }
}
