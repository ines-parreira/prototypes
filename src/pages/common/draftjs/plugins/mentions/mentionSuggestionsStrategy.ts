/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */

import findWithRegex from 'find-with-regex'
import _escapeRegExp from 'lodash/escapeRegExp'
import {ContentBlock} from 'draft-js'

const mentionSuggestionStrategy =
    (trigger: string, regExp: string) =>
    (
        contentBlock: ContentBlock,
        callback: (start: number, end: number) => void
    ) => {
        findWithRegex(
            new RegExp(`(\\s|^)${_escapeRegExp(trigger)}${regExp}`, 'g'),
            contentBlock,
            callback
        )
    }

export default mentionSuggestionStrategy
