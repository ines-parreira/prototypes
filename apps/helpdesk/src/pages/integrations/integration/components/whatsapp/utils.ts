import { findLast } from 'lodash'
import type { Node } from 'slack-message-parser'
import slackMessageParser, { NodeType } from 'slack-message-parser'

import { TicketChannel } from 'business/types/ticket'
import { MacroActionName } from 'models/macroAction/types'
import type { TicketMessage } from 'models/ticket/types'
import type { WhatsAppMessageTemplate } from 'models/whatsAppMessageTemplates/types'
import { getMoment, stringToDatetime } from 'utils/date'

export const WHATSAPP_VARIABLE_REGEX = /(\{\{\d\}\})/

export const countDistinctVariables = (message: string): number => {
    const matches = message.match(/\{\{(\d+)\}\}/g)
    let highestNumber = 0

    if (matches) {
        matches.forEach((match) => {
            // Remove the "{{" and "}}" and parse as an integer
            const number = parseInt(match.slice(2, -2))
            if (number > highestNumber) {
                highestNumber = number
            }
        })
    }

    return highestNumber
}

/* checks that every variable is filled */
export const isWhatsAppMessageValid = (
    message: string,
    values: string[],
): boolean => {
    const numberOfVariables = countDistinctVariables(message)
    const filledValues = values.filter(Boolean)

    return numberOfVariables === filledValues.length
}

const toHTML = (node: Node): string => {
    switch (node.type) {
        case NodeType.Root:
            return `<div>${node.children.map(toHTML).join('')}</div>`
        case NodeType.Text:
            return node.text
        case NodeType.Bold:
            return `<strong>${node.children.map(toHTML).join('')}</strong>`
        case NodeType.Italic:
            return `<i>${node.children.map(toHTML).join('')}</i>`
        case NodeType.Strike:
            return `<del>${node.children.map(toHTML).join('')}</del>`
        default:
            return node.source
    }
}

export const whatsAppMessageTemplateToHtml = (templateString: string) =>
    toHTML(slackMessageParser(templateString))

export const normalizeLocale = (locale: string): string => {
    return locale.replace('_', '-').toLowerCase()
}

export const createApplyExternalTemplateAction = (
    template: WhatsAppMessageTemplate,
) => ({
    name: MacroActionName.ApplyExternalTemplate,
    type: 'system',
    title: 'Apply External Template',
    arguments: {
        provider: 'whatsapp',
        template_id: template.id,
        template: template,
        body: Array(
            countDistinctVariables(template.components.body.value),
        ).fill({ type: 'text', value: '' }),
        ...(template.components.header?.type === 'text' &&
            template.components.header?.value && {
                header: Array(
                    countDistinctVariables(
                        template.components.header.value ?? '',
                    ),
                ).fill({ type: 'text', value: '' }),
            }),
    },
})

export const isWhatsAppWindowOpen = (
    customerMessages: TicketMessage[],
): boolean => {
    const lastCustomerWhatsAppMessage = findLast(
        customerMessages,
        (message) => message.channel === TicketChannel.WhatsApp,
    )

    if (!lastCustomerWhatsAppMessage) return false

    const now = getMoment()
    const lastMessageSentAt = stringToDatetime(
        lastCustomerWhatsAppMessage.created_datetime,
    )

    return lastMessageSentAt
        ? now.isSameOrBefore(lastMessageSentAt.add(24, 'hours'))
        : false
}
