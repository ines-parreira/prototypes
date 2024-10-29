/*
 * This function computes the similarity score between two strings.
 *
 * Higher value returned means that the two strings are more different.
 * Returns 0 for identical strings, maximal value is 1 for completely different strings (the result is normalized)
 *
 * See https://en.wikipedia.org/wiki/Levenshtein_distance for more information.
 */
import {distance} from 'fastest-levenshtein'

export const computeTextSimilarityScore = (a: string, b: string): number => {
    const an = !!a ? a.length : 0
    const bn = !!b ? b.length : 0
    if ((an === 0 && bn === 0) || a === b) {
        return 0
    }

    const d = distance(a, b)
    if (isNaN(d)) {
        return 1
    }

    const maxLength = Math.max(an, bn)
    return d / maxLength
}
