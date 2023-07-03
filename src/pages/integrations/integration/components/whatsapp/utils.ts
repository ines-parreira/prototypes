import slackMessageParser, {Node, NodeType} from 'slack-message-parser'
import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'

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
    values: string[]
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

export const getTemplateLanguageOptions = (
    templates: WhatsAppMessageTemplate[]
) => {
    const languages = templates.map((template) => template.language)
    return Array.from(new Set(languages))
}
