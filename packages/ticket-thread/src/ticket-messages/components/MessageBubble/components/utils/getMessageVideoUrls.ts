import { extractGorgiasVideoDivFromHtmlContent } from '@repo/utils'

import type { MessageBodyItem } from '../MessageBody'
import { getMessageContent } from './getMessageContent'

export function getMessageVideoUrls(
    item: MessageBodyItem,
    isExpanded: boolean,
) {
    const { isHtml, sanitizedHtml } = getMessageContent(item, isExpanded)

    if (!sanitizedHtml || !isHtml) {
        return null
    }

    return extractGorgiasVideoDivFromHtmlContent(sanitizedHtml).videoUrls
}
