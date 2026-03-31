type SplitErrorBannerMessageResult = {
    title?: string
    content?: string
}

const TITLE_MAX_LENGTH = 96
const SENTENCE_SPLIT_REGEX = /([.!?])\s+/
const SEPARATOR_SPLITS = [': ', ' - ', ' — ']
const HTML_TAG_REGEX = /<[^>]+>/

function splitAtSentenceBoundary(
    text: string,
): SplitErrorBannerMessageResult | null {
    const match = SENTENCE_SPLIT_REGEX.exec(text)

    if (!match) {
        return null
    }

    const splitIndex = match.index + match[0].length - 1
    const title = text.slice(0, splitIndex).trim()
    const content = text.slice(splitIndex + 1).trim()

    if (!title || !content || title.length > TITLE_MAX_LENGTH) {
        return null
    }

    return { title, content }
}

function splitAtSeparator(text: string): SplitErrorBannerMessageResult | null {
    for (const separator of SEPARATOR_SPLITS) {
        const separatorIndex = text.indexOf(separator)

        if (separatorIndex <= 0) {
            continue
        }

        const title = text.slice(0, separatorIndex).trim()
        const content = text.slice(separatorIndex + separator.length).trim()

        if (!title || !content || title.length > TITLE_MAX_LENGTH) {
            continue
        }

        return { title, content }
    }

    return null
}

function splitAtNearestWhitespace(text: string): SplitErrorBannerMessageResult {
    if (text.length <= TITLE_MAX_LENGTH) {
        return { title: text }
    }

    const beforeLimit = text.lastIndexOf(' ', TITLE_MAX_LENGTH)
    const afterLimit = text.indexOf(' ', TITLE_MAX_LENGTH)
    const splitIndex = beforeLimit > 0 ? beforeLimit : afterLimit

    if (splitIndex <= 0) {
        return { title: text }
    }

    const title = text.slice(0, splitIndex).trim()
    const content = text.slice(splitIndex + 1).trim()

    if (!title || !content) {
        return { title: text }
    }

    return { title, content }
}

/**
 * Splits plain-text error copy into a compact banner title and optional body.
 * If the input contains HTML, it is returned as content only to avoid breaking markup.
 */
export function splitErrorBannerMessage(
    text: string,
): SplitErrorBannerMessageResult {
    if (HTML_TAG_REGEX.test(text)) {
        return { content: text.trim() }
    }

    const normalizedText = text.replace(/\s+/g, ' ').trim()

    if (!normalizedText) {
        return {}
    }

    return (
        splitAtSentenceBoundary(normalizedText) ??
        splitAtSeparator(normalizedText) ??
        splitAtNearestWhitespace(normalizedText)
    )
}
