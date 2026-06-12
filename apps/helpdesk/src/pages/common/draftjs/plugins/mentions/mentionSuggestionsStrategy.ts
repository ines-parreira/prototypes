/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */
import type { ContentBlock } from 'draft-js'
import findWithRegex from 'find-with-regex'
import { escapeRegExp } from '@gorgias/toolkit'

const mentionSuggestionStrategy =
    (trigger: string, regExp: string) =>
    (
        contentBlock: ContentBlock,
        callback: (start: number, end: number) => void,
    ) => {
        findWithRegex(
            new RegExp(`(\\s|^)${escapeRegExp(trigger)}${regExp}`, 'g'),
            contentBlock,
            callback,
        )
    }

export { mentionSuggestionStrategy }
