import { extractGorgiasVideoDivFromHtmlContent, parseMedia } from 'utils'
import { linkifyHtml, linkifyString, sanitizeHtmlDefault } from 'utils/html'

export function processContent(
    content: string,
    isHtml: boolean,
): { processedContent: string; videoUrls: string[] } {
    const parsedMedia = parseMedia(content, '1000x')
    const linkifiedContent = isHtml
        ? linkifyHtml(parsedMedia)
        : linkifyString(parsedMedia)
    const sanitizedContent = sanitizeHtmlDefault(linkifiedContent)

    if (isHtml) {
        const { htmlCleaned, videoUrls } =
            extractGorgiasVideoDivFromHtmlContent(sanitizedContent)
        return {
            processedContent: htmlCleaned,
            videoUrls,
        }
    }

    return {
        processedContent: sanitizedContent !== 'null' ? sanitizedContent : '',
        videoUrls: [],
    }
}
