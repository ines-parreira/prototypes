import { useMemo } from 'react'

import {
    linkifyHtml,
    linkifyString,
    parseMedia,
    sanitizeHtmlDefault,
} from '@repo/utils'
import classNames from 'classnames'

import { Banner, IconName } from '@gorgias/axiom'

import type { TicketThreadRegularMessageItem } from '../../hooks/messages/types'

import css from './MessageBody.less'

type MessageBodyProps = {
    item: TicketThreadRegularMessageItem
}

export function MessageBody({ item }: MessageBodyProps) {
    const { body_html, body_text, stripped_html, stripped_text, meta } =
        item.data

    const trimmedHtml = body_html?.trim() || ''
    const trimmedText = body_text?.trim() || ''
    const trimmedStrippedHtml = stripped_html?.trim() || ''
    const trimmedStrippedText = stripped_text?.trim() || ''
    const content = trimmedHtml || trimmedText
    const isHtml = !!trimmedHtml

    const strippedContent =
        trimmedHtml && trimmedStrippedHtml
            ? trimmedStrippedHtml
            : trimmedStrippedText

    const isStripped = useMemo(
        () =>
            !!strippedContent &&
            strippedContent.replace(/\s+/g, '') !== content.replace(/\s+/g, ''),
        [content, strippedContent],
    )

    const contentToRender = isStripped ? strippedContent : content

    const sanitizedHtml = useMemo(() => {
        const parsedMedia = parseMedia(contentToRender, '1000x')

        const linkifiedContent = isHtml
            ? linkifyHtml(parsedMedia)
            : linkifyString(parsedMedia)

        return sanitizeHtmlDefault(linkifiedContent)
    }, [contentToRender, isHtml])

    const displayedContent = sanitizedHtml !== 'null' ? sanitizedHtml : ''

    const messageMeta = meta as {
        body_html_truncated?: boolean
        body_text_truncated?: boolean
    } | null

    const isTruncated = isStripped
        ? trimmedHtml && trimmedStrippedHtml
            ? messageMeta?.body_html_truncated
            : messageMeta?.body_text_truncated
        : trimmedHtml
          ? messageMeta?.body_html_truncated
          : messageMeta?.body_text_truncated

    if (!displayedContent && !isStripped) {
        return null
    }

    return (
        <>
            <div
                className={classNames('message-content', css.content, {
                    [css.whitespace]: !isHtml,
                })}
                dangerouslySetInnerHTML={{ __html: displayedContent }}
            />
            {isTruncated && (
                <Banner
                    isClosable={false}
                    icon={IconName.Info}
                    description="This message is too large to display. To see the entire message, open it in the original provider."
                />
            )}
        </>
    )
}
