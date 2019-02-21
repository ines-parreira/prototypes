/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */

import findWithRegex from 'find-with-regex'
import _ from 'lodash'

const mentionSuggestionStrategy = (trigger, regExp) => (contentBlock, callback) => {
    findWithRegex(new RegExp(`(\\s|^)${_.escapeRegExp(trigger)}${regExp}`, 'g'), contentBlock, callback)
}

export default mentionSuggestionStrategy
