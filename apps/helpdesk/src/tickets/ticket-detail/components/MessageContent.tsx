import { useCallback, useContext, useMemo } from 'react'

import cn from 'classnames'
import ReactPlayer from 'react-player'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import Ellipsis from 'pages/common/components/Ellipsis'
import { parseHtml } from 'utils/html'

import { MessageExpansionContext } from '../context/MessageExpansionContext'
import { processContent } from '../helpers/processContent'

import css from './MessageContent.less'

type MessageContentProps = {
    message: TicketMessage
    isFailed: boolean
}

export function MessageContent({ message, isFailed }: MessageContentProps) {
    const { expandedMessages, toggleMessage } = useContext(
        MessageExpansionContext,
    )
    const {
        id: messageId,
        body_html: rawHtml,
        body_text: rawText,
        stripped_html,
        stripped_text,
        meta,
    } = message

    const isMessageExpanded = useMemo(
        () => !!messageId && expandedMessages.includes(messageId),
        [messageId, expandedMessages],
    )

    const fullHtml = rawHtml?.trim() || ''
    const fullText = rawText?.trim() || ''
    const strippedHtml = stripped_html?.trim() || ''
    const strippedText = stripped_text?.trim() || ''

    const fullContent = fullHtml || fullText
    const strippedContent = strippedHtml || strippedText
    const isHtml = Boolean(fullHtml || strippedHtml)

    const isStripped = useMemo(
        () =>
            !!strippedContent &&
            strippedContent.replace(/\s+/g, '') !==
                fullContent.replace(/\s+/g, ''),
        [strippedContent, fullContent],
    )

    const contentToRender = useMemo(() => {
        if (isStripped && !isMessageExpanded) {
            return strippedContent
        }
        return fullContent
    }, [isStripped, isMessageExpanded, strippedContent, fullContent])

    const isTruncated = (meta as Record<string, unknown>)?.[
        isHtml ? 'body_html_truncated' : 'body_text_truncated'
    ]

    const forceDefaultTheme = useMemo(
        () =>
            isHtml &&
            parseHtml(contentToRender).querySelectorAll('[style*="color"]')
                .length > 0,
        [contentToRender, isHtml],
    )

    const { processedContent, videoUrls } = useMemo(
        () => processContent(contentToRender, isHtml),
        [contentToRender, isHtml],
    )

    const handleShowFullContent = useCallback(() => {
        toggleMessage(messageId)
    }, [messageId, toggleMessage])

    if (!processedContent) return null

    return (
        <>
            <div
                className={cn(css.container, {
                    [css.whiteSpace]: !isHtml,
                    [css.failed]: isFailed,
                    light: forceDefaultTheme,
                })}
            >
                <div
                    className={css.content}
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                />
            </div>
            {isTruncated && (
                <span className={css['disclaimerTruncatedMessage']}>
                    <i className="material-icons">info_outlined</i>
                    <p>
                        This message is too large to display. To see the entire
                        message, open it in the original provider.
                    </p>
                </span>
            )}
            {isStripped && (
                <Ellipsis
                    title="Show full content"
                    onClick={handleShowFullContent}
                />
            )}

            {videoUrls.map((url) => (
                <div key={url} className={css.content}>
                    <ReactPlayer
                        url={url}
                        controls
                        light
                        width={400}
                        height={(400 * 9) / 16}
                    />
                </div>
            ))}
        </>
    )
}
