import type { MessageBodyItem } from '../MessageBody'

function normalizeContent(content: string): string {
    return content.replace(/\s+/g, '')
}

export function getMessageContent(item: MessageBodyItem) {
    const { body_html, body_text, stripped_html, stripped_text } = item.data
    const messageId = item.data.id

    const trimmedHtml = body_html?.trim() || ''
    const trimmedText = body_text?.trim() || ''
    const trimmedStrippedHtml = stripped_html?.trim() || ''
    const trimmedStrippedText = stripped_text?.trim() || ''

    const content = trimmedHtml || trimmedText
    const isHtml = !!trimmedHtml
    const isStrippedContentHtml = !!(trimmedHtml && trimmedStrippedHtml)
    const strippedContent = isStrippedContentHtml
        ? trimmedStrippedHtml
        : trimmedStrippedText

    const isStripped =
        !!strippedContent &&
        normalizeContent(strippedContent) !== normalizeContent(content)

    return {
        messageId,
        content,
        strippedContent,
        isHtml,
        isStripped,
        isStrippedContentHtml,
    }
}
