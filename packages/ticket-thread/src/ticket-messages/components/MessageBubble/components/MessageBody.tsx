import classNames from 'classnames'

import { Banner } from '@gorgias/axiom'
import type { TicketMessageTranslation } from '@gorgias/helpdesk-types'

import { useExpandedMessages } from '#ticket-messages/context/ExpandedMessages'
import { ReviewedProductCard } from './ReviewedProductCard'
import { SimilarProductsSearch } from './SimilarProductsSearch'
import { useSimilarProductsSearch } from './useSimilarProductSearch'
import { getMessageContent } from './utils/getMessageContent'
import { getReviewedProductData } from './utils/product'
import { useDarkModeReadableEmailHtml } from './utils/useDarkModeReadableEmailHtml'

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
    const readableContent = useDarkModeReadableEmailHtml(
        isHtml ? displayedContent : '',
    )
    const content = isHtml ? readableContent : displayedContent
    const reviewedProduct = getReviewedProductData(item.data.meta)
    const {
        shouldRender: shouldRenderSimilarProductsSearch,
        productReference,
    } = useSimilarProductsSearch(item.data.meta)

    if (shouldRenderSimilarProductsSearch && productReference) {
        return <SimilarProductsSearch {...productReference} />
    }

    if (!displayedContent && !isStripped && !reviewedProduct) {
        return null
    }

    return (
        <>
            {displayedContent || isStripped ? (
                <div
                    className={classNames(
                        'message-content',
                        css.content,
                        className,
                        {
                            [css.whitespace]: !isHtml,
                        },
                    )}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            ) : null}
            {reviewedProduct && (
                <ReviewedProductCard product={item.data.meta} />
            )}
            {isTruncated && (
                <Banner
                    isClosable={false}
                    icon="info"
                    description="This message is too large to display. To see the entire message, open it in the original provider."
                />
            )}
        </>
    )
}
