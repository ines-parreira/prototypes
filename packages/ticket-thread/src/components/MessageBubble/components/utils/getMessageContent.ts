import {
    linkifyHtml,
    linkifyString,
    parseMedia,
    sanitizeHtmlDefault,
} from '@repo/utils'

import type { MessageBodyItem } from '../MessageBody'
import { normalizeTicketMessageHtml } from './normalizeTicketMessageHtml'

function normalizeContent(content: string): string {
    return content.replace(/\s+/g, '')
}

export function getMessageContent(
    item: MessageBodyItem,
    isExpanded: boolean = false,
) {
    const {
        body_html,
        body_text,
        stripped_html,
        stripped_text,
        translations,
        meta,
    } = item.data
    const messageId = item.data.id

    const trimmedHtml = body_html?.trim() || ''
    const trimmedText = body_text?.trim() || ''
    const trimmedStrippedHtml = stripped_html?.trim() || ''
    const trimmedStrippedText = stripped_text?.trim() || ''
    const trimmedTranslatedHtml = translations?.stripped_html?.trim() || ''
    const trimmedTranslatedText = translations?.stripped_text?.trim() || ''

    const content = trimmedHtml || trimmedText
    const isHtml = !!trimmedHtml

    const isStrippedContentHtml = !!(trimmedHtml && trimmedStrippedHtml)
    const strippedContent = isStrippedContentHtml
        ? trimmedStrippedHtml
        : trimmedStrippedText
    const isStripped =
        !!strippedContent &&
        normalizeContent(strippedContent) !== normalizeContent(content)

    const hasTranslations = !!trimmedTranslatedHtml || !!trimmedTranslatedText
    const translatedStrippedContent = trimmedTranslatedHtml
        ? trimmedTranslatedHtml
        : trimmedTranslatedText

    const showingStrippedContent = isStripped && !isExpanded

    const contentToRender =
        hasTranslations && !isExpanded
            ? translatedStrippedContent
            : showingStrippedContent
              ? strippedContent
              : content

    const parsedMedia = parseMedia(contentToRender, '1000x')
    const linkifiedContent = isHtml
        ? linkifyHtml(parsedMedia)
        : linkifyString(parsedMedia)
    const sanitizedHtml = normalizeTicketMessageHtml(
        sanitizeHtmlDefault(linkifiedContent),
    )

    const messageMeta = meta as {
        body_html_truncated?: boolean
        body_text_truncated?: boolean
    } | null

    const isTruncated = showingStrippedContent
        ? isStrippedContentHtml
            ? messageMeta?.body_html_truncated
            : messageMeta?.body_text_truncated
        : isHtml
          ? messageMeta?.body_html_truncated
          : messageMeta?.body_text_truncated

    return {
        messageId,
        isHtml,
        isStripped,
        isStrippedContentHtml,
        showingStrippedContent,
        sanitizedHtml,
        isTruncated,
    }
}
