import { useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import ReactPlayer from 'react-player'

import type { TicketMessageTranslation } from '@gorgias/helpdesk-types'

import type { TicketMessage } from 'models/ticket/types'
import Ellipsis from 'pages/common/components/Ellipsis'
import { extractGorgiasVideoDivFromHtmlContent, parseMedia } from 'utils'
import {
    linkifyHtml,
    linkifyString,
    parseHtml,
    sanitizeHtmlDefault,
} from 'utils/html'

import css from './Content.less'

type Props = {
    html?: string
    messageId?: number
    meta: TicketMessage['meta']
    text?: string
    strippedHtml?: string | null
    strippedText?: string | null
    messagePosition: number
    toggleQuote: (messageId: number | undefined) => void
    isMessageExpanded: boolean
    translations?: TicketMessageTranslation
}

const Content = ({
    html,
    messageId,
    meta,
    text,
    strippedHtml,
    strippedText,
    messagePosition,
    toggleQuote,
    isMessageExpanded,
    translations,
}: Props) => {
    const trimmedHtml = html?.trim() || ''
    const trimmedText = text?.trim() || ''
    const trimmedStrippedHtml = strippedHtml?.trim() || ''
    const trimmedStrippedText = strippedText?.trim() || ''
    const trimmedTranslatedHtml = translations?.stripped_html?.trim() || ''
    const trimmedTranslatedText = translations?.stripped_text?.trim() || ''
    const content = trimmedHtml || trimmedText

    const isHtml = !!trimmedHtml
    const hasTranslations = !!trimmedTranslatedHtml || !!trimmedTranslatedText

    const strippedContent =
        trimmedHtml && trimmedStrippedHtml
            ? trimmedStrippedHtml
            : trimmedStrippedText

    const translatedStrippedContent = trimmedTranslatedHtml
        ? trimmedTranslatedHtml
        : trimmedTranslatedText

    // only show quoteButton if the contents of body and stripped are different
    // we're ignoring whitespaces because mailgun sends stripped_html without spaces
    const isStripped = useMemo(
        () =>
            !!strippedContent &&
            strippedContent.replace(/\s+/g, '') !== content.replace(/\s+/g, ''),
        [content, strippedContent],
    )

    const contentToRender = useMemo(() => {
        /**
         * Translations are only present when we want to shown them.
         */
        if (hasTranslations && !isMessageExpanded) {
            return translatedStrippedContent
        }
        if (isStripped && !isMessageExpanded) {
            return strippedContent
        }

        return content
    }, [
        isStripped,
        isMessageExpanded,
        strippedContent,
        content,
        hasTranslations,
        translatedStrippedContent,
    ])

    const sanitizedHtml = useMemo(() => {
        const parsedMedia = parseMedia(contentToRender, '1000x')

        const linkifiedContent = isHtml
            ? linkifyHtml(parsedMedia)
            : linkifyString(parsedMedia)

        return sanitizeHtmlDefault(linkifiedContent)
    }, [contentToRender, isHtml])

    const videosData = useMemo(
        () => extractGorgiasVideoDivFromHtmlContent(sanitizedHtml),
        [sanitizedHtml],
    )

    const displayedContent =
        sanitizedHtml && isHtml
            ? videosData.htmlCleaned
            : sanitizedHtml !== 'null'
              ? sanitizedHtml
              : ''

    const videoUrls = sanitizedHtml && isHtml ? videosData.videoUrls : []

    const forceDefaultTheme = useMemo(
        () =>
            isHtml &&
            parseHtml(contentToRender).querySelectorAll('[style*="color"]')
                .length,
        [contentToRender, isHtml],
    )

    const handleShowFullContent = () => {
        if (messagePosition > 1) {
            logEvent(SegmentEvent.MessageThreadClicked)
        }
        toggleQuote(messageId)
    }

    if (!displayedContent && !isStripped) {
        return null
    }

    const isTruncated =
        isStripped && !isMessageExpanded
            ? trimmedHtml && trimmedStrippedHtml
                ? meta?.body_html_truncated
                : meta?.body_text_truncated
            : trimmedHtml
              ? meta?.body_html_truncated
              : meta?.body_text_truncated

    return (
        <>
            <div
                className={classNames('message-content', css.content, {
                    [css['white-space']]: !isHtml,
                    light: forceDefaultTheme,
                })}
                dangerouslySetInnerHTML={{ __html: displayedContent }}
            />
            {isTruncated && (
                <span className={css['disclaimer-truncated-message']}>
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

            {videoUrls.map((url, idx) => (
                <div key={idx} className={classNames(css.content)}>
                    <ReactPlayer
                        url={url}
                        controls={true}
                        light={true}
                        width={400}
                        height={(400 * 9) / 16}
                    />
                </div>
            ))}
        </>
    )
}

export default Content
