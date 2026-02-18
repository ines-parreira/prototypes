import _isString from 'lodash/isString'
import _words from 'lodash/words'

/**
 * Remove a suffix from a string.
 *
 * Migrated from: apps/helpdesk/src/utils/string.ts
 */
export const removeSuffix = (data: string, suffix: string): string => {
    if (typeof data === 'string' && data.endsWith(suffix)) {
        return data.replace(suffix, '')
    }

    return data
}

/**
 * Count lines of a text.
 */
export const countLines = (text: string): number => {
    if (!_isString(text)) {
        return 0
    }

    return text.split(/\r\n|\r|\n/).length
}

export const countWords = (text: string): number => {
    return _words(text, /\S+/g).length
}

export const truncateWords = (text: string, n: number): string => {
    if (n < 0) {
        throw new Error('Unsupported negative words number')
    } else if (n === 0) {
        return ''
    }

    let isProcessingWord = false
    let processedWordsNum = 0
    for (let i = 0; i < text.length; i++) {
        if (/\S/.exec(text.charAt(i))) {
            if (!isProcessingWord) {
                processedWordsNum++
            }
            isProcessingWord = true
        } else {
            if (processedWordsNum === n) {
                return text.slice(0, i)
            }
            isProcessingWord = false
        }
    }

    return text
}

export const humanizeArray = (text: string[]) => {
    if (text.length < 2) {
        return text[0] ?? ''
    }
    const firsts = text.slice(0, -1)
    return `${firsts.join(', ')} and ${text[text.length - 1]}`
}
