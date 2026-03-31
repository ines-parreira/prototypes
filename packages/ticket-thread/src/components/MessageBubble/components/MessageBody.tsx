import classNames from 'classnames'

import { Banner, IconName } from '@gorgias/axiom'
import type { TicketMessageTranslation } from '@gorgias/helpdesk-types'

import { useExpandedMessages } from '../../../contexts/ExpandedMessages'
import { getMessageContent } from './utils/getMessageContent'

import css from './MessageBody.less'

export type MessageBodyItem = {
    data: {
        body_html?: string | null
        body_text?: string | null
        stripped_html?: string | null
        stripped_text?: string | null
        translations?: TicketMessageTranslation | null
        meta?: unknown
        id?: number | null
    }
}

type MessageBodyProps = {
    className?: string
    item: MessageBodyItem
}

export function MessageBody({ className, item }: MessageBodyProps) {
    const { isMessageExpanded } = useExpandedMessages()
    const isExpanded = isMessageExpanded(item.data.id)
    const { sanitizedHtml, isHtml, isStripped, isTruncated } =
        getMessageContent(item, isExpanded)
    const displayedContent = sanitizedHtml !== 'null' ? sanitizedHtml : ''

    if (!displayedContent && !isStripped) {
        return null
    }

    return (
        <>
            <div
                className={classNames(
                    'message-content',
                    css.content,
                    className,
                    {
                        [css.whitespace]: !isHtml,
                    },
                )}
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
