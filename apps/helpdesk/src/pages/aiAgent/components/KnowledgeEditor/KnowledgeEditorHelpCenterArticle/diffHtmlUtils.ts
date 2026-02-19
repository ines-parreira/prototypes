import HtmlDiff from 'htmldiff-js'

const NON_BMP_CHAR_PATTERN = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
const NON_BMP_TOKEN_PATTERN = /HDIFFCP([0-9A-F]+)TOKEN/g

const BREAK_MARKER_CLASS = 'diff-break-marker'
const BLOCK_CONTAINER_TAGS = new Set([
    'DIV',
    'P',
    'LI',
    'TD',
    'TH',
    'BLOCKQUOTE',
    'FIGCAPTION',
])

function normalizeWhitespace(value: string): string {
    return value.replace(/\u00A0/g, ' ').trim()
}

function encodeNonBmpCharacters(content: string): string {
    return content.replace(NON_BMP_CHAR_PATTERN, (match) => {
        const codePoint = match.codePointAt(0)

        if (!codePoint) {
            return match
        }

        return `HDIFFCP${codePoint.toString(16).toUpperCase()}TOKEN`
    })
}

function restoreNonBmpCharacters(content: string): string {
    return content.replace(NON_BMP_TOKEN_PATTERN, (fullMatch, hexCodePoint) => {
        const codePoint = Number.parseInt(hexCodePoint, 16)

        return Number.isNaN(codePoint)
            ? fullMatch
            : String.fromCodePoint(codePoint)
    })
}

function isWhitespaceOnlyDiffMarker(marker: HTMLElement): boolean {
    for (const node of Array.from(marker.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (normalizeWhitespace(node.textContent ?? '') !== '') {
                return false
            }
            continue
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement
            if (element.tagName !== 'BR') {
                return false
            }
            continue
        }

        return false
    }

    return true
}

function isStandaloneBreakContainer(marker: HTMLElement): boolean {
    const parent = marker.parentElement

    if (!parent || !BLOCK_CONTAINER_TAGS.has(parent.tagName)) {
        return false
    }

    for (const sibling of Array.from(parent.childNodes)) {
        if (sibling === marker) {
            continue
        }

        if (sibling.nodeType === Node.TEXT_NODE) {
            if (normalizeWhitespace(sibling.textContent ?? '') !== '') {
                return false
            }
            continue
        }

        if (sibling.nodeType === Node.ELEMENT_NODE) {
            if ((sibling as HTMLElement).tagName === 'BR') {
                continue
            }
            return false
        }

        return false
    }

    return true
}

function normalizeDiffBreakMarkers(content: string): string {
    if (typeof DOMParser === 'undefined') {
        return content
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')

    for (const marker of Array.from(
        doc.body.querySelectorAll<HTMLElement>('ins, del'),
    )) {
        if (
            !isWhitespaceOnlyDiffMarker(marker) ||
            !isStandaloneBreakContainer(marker)
        ) {
            continue
        }

        marker.innerHTML = '<br />'
        marker.classList.add(BREAK_MARKER_CLASS)
    }

    return doc.body.innerHTML
}

export function computeSafeHtmlDiff(oldContent: string, newContent: string) {
    const encodedOldContent = encodeNonBmpCharacters(oldContent)
    const encodedNewContent = encodeNonBmpCharacters(newContent)

    const rawDiff = HtmlDiff.execute(encodedOldContent, encodedNewContent)

    return normalizeDiffBreakMarkers(restoreNonBmpCharacters(rawDiff))
}
