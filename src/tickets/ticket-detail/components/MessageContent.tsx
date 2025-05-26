import { useMemo } from 'react'

import classNames from 'classnames'
import ReactPlayer from 'react-player'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import { parseHtml } from 'utils/html'

import { processContent } from '../helpers/processContent'

import css from './MessageContent.less'

type MessageContentProps = {
    message: TicketMessage
    isFailed: boolean
}

export function MessageContent({ message, isFailed }: MessageContentProps) {
    const {
        body_html: rawHtml,
        body_text: rawText,
        stripped_html,
        stripped_text,
        meta,
    } = message

    const html = stripped_html?.trim() || rawHtml?.trim() || ''
    const text = stripped_text?.trim() || rawText?.trim() || ''
    const isHtml = Boolean(html)
    const rawContent = html || text
    const isTruncated = (meta as Record<string, unknown>)?.[
        isHtml ? 'body_html_truncated' : 'body_text_truncated'
    ]

    const forceDefaultTheme = useMemo(
        () =>
            isHtml &&
            parseHtml(rawContent).querySelectorAll('[style*="color"]').length >
                0,
        [rawContent, isHtml],
    )

    const { processedContent, videoUrls } = useMemo(
        () => processContent(rawContent, isHtml),
        [rawContent, isHtml],
    )

    if (!processedContent) return null

    return (
        <>
            <div
                className={classNames('message-content', css.content, {
                    [css.whiteSpace]: !isHtml,
                    [css.failed]: isFailed,
                    light: forceDefaultTheme,
                })}
                dangerouslySetInnerHTML={{ __html: processedContent }}
            />
            {isTruncated && (
                <span className={css['disclaimerTruncatedMessage']}>
                    <i className="material-icons">info_outlined</i>
                    <p>
                        This message is too large to display. To see the entire
                        message, open it in the original provider.
                    </p>
                </span>
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
