import { useMemo } from 'react'

import {
    linkifyHtml,
    linkifyString,
    parseMedia,
    sanitizeHtmlDefault,
} from '@repo/utils'
import classNames from 'classnames'

import { Banner, IconName } from '@gorgias/axiom'

import { useExpandedMessages } from '../../../contexts/ExpandedMessages'
import { getMessageContent } from './utils/getMessageContent'

import css from './MessageBody.less'

export type MessageBodyItem = {
    data: {
        body_html?: string | null
        body_text?: string | null
        stripped_html?: string | null
        stripped_text?: string | null
        meta?: unknown
        id?: number | null
    }
}

type MessageBodyProps = {
    item: MessageBodyItem
}

export function MessageBody({ item }: MessageBodyProps) {
    const { meta } = item.data
    const {
        messageId,
        content,
        strippedContent,
        isHtml,
        isStripped,
        isStrippedContentHtml,
    } = getMessageContent(item)
    const { isMessageExpanded } = useExpandedMessages()
    const isExpanded = isMessageExpanded(messageId)

    const showingStrippedContent = isStripped && !isExpanded
    const contentToRender = showingStrippedContent ? strippedContent : content

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

    if (!displayedContent && !isStripped) {
        return null
    }

    const isTruncated = showingStrippedContent
        ? isStrippedContentHtml
            ? messageMeta?.body_html_truncated
            : messageMeta?.body_text_truncated
        : isHtml
          ? messageMeta?.body_html_truncated
          : messageMeta?.body_text_truncated

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
