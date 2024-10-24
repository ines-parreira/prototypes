import {convertToRaw, ContentState} from 'draft-js'
import {fromJS, Map, List} from 'immutable'
import {omit} from 'lodash'
import _forOwn from 'lodash/forOwn'
import _get from 'lodash/get'

import {TicketMessageSourceType} from 'business/types/ticket'
import {AttachmentEnum} from 'common/types'
import {isImmutable} from 'common/utils'
import {MacroAction, MacroActionName} from 'models/macroAction/types'
import {ApplyExternalTemplateAction} from 'models/whatsAppMessageTemplates/types'
import {
    whatsAppMessageTemplateToHtml,
    WHATSAPP_VARIABLE_REGEX,
} from 'pages/integrations/integration/components/whatsapp/utils'
import {EMPTY_SENDER} from 'state/ticket/constants'
import {canLeaveInternalNote} from 'tickets/common/utils'

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

    return newText
}

export const transformExternalTemplatePart = (
    text: string,
    args?: {
        type: string
        value: string
    }[]
): string => {
    const lines = text.split('\n')

    const newLines = lines.map((line) => {
        const newText = args?.length
            ? replaceWhatsAppTemplateVariables(line, args)
            : line
        return whatsAppMessageTemplateToHtml(newText)
    })

    return newLines.join('<br/>')
}

export function upsertNewMessageAction(
    message: NewMessage,
    action: Map<any, any>
): NewMessage {
    const newMessage = {...message}

    newMessage.actions = isImmutable(newMessage.actions)
        ? newMessage.actions
        : fromJS(newMessage.actions)

    if (!newMessage.actions || newMessage.actions.size === 0) {
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

const replaceVariablesAndConvert = (
    text: string,
    args?: {
        type: string
        value: string
    }[]
): {body_html: string; body_text: string} => ({
    body_html: transformExternalTemplatePart(text, args),
    body_text: args?.length
        ? replaceWhatsAppTemplateVariables(text, args)
        : text,
})

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

    const {template, body: bodyArgs, header: headerArgs} = action.arguments
    const {
        body: templateBody,
        header: templateHeader,
        footer,
    } = template.components

    const convertedBody = replaceVariablesAndConvert(
        templateBody.value,
        bodyArgs
    )
    const convertedHeader = templateHeader?.value
        ? replaceVariablesAndConvert(templateHeader.value, headerArgs)
        : null

    const headerHtml = convertedHeader
        ? `<header>${convertedHeader.body_html}</header><br/>`
        : ''
    const footerHtml = footer?.value
        ? `<br/><footer>${whatsAppMessageTemplateToHtml(footer.value)}</footer>`
        : ''

    const body_html = `<section>${headerHtml}<div>${convertedBody.body_html}</div>${footerHtml}</section>`
    const body_text = [
        convertedHeader?.body_text,
        convertedBody.body_text,
        footer?.value,
    ]
        .filter(Boolean)
        .join('\n')

    const message = upsertNewMessageAction(
        newMessage,
        fromJS(omit(action, ['arguments.template']))
    )

    return {
        ...message,
        body_html,
        body_text,
    }
}

export const getProductCardAttachmentsDeletionOrder = (
    attachments: Map<any, any>[]
): number[] => {
    const indices = []
    for (let index = attachments.length - 1; index >= 0; index--) {
        if (attachments[index].get('content_type') === AttachmentEnum.Product) {
            indices.push(index)
        }
    }
    return indices
}
