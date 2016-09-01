import {List} from 'immutable'
import _ from 'lodash'

/**
 * Conjugate a verb (base form) to past simple
 * @param verb
 * @returns {*}
 */
function conjugateToPastSimple(verb) {
    const IRREGULAR_VERBS = [
        {base: 'pay', pastSimple: 'paid'},
        {base: 'send', pastSimple: 'sent'},
        {base: 'set', pastSimple: 'set'},
    ];
    // check if verb is an irregular verb
    const conjVerb = _.find(IRREGULAR_VERBS, (v) => v.base === verb)

    // otherwise we apply some english rules to determine its conjugation
    if (conjVerb) {
        return conjVerb.pastSimple
    } else if (/e$/.test(verb)) {
        return `${verb}d`
    } else if (/y$/.test(verb) && !/[aeiou]$/.test(verb.slice(0, -1))) {
        return `${verb.slice(0, -1)}ied`
    } else if ((verb.match(/[aeiouy]/g) || []).length === 1 && !/[aeiouy]$/.test(verb) &&
      /[aeiouy]$/.test(verb.slice(0, -1))) {
        return `${verb + verb.substr(-1)}ed`
    }
    return `${verb}ed`
}

/**
 * Humanize action type to be more readable
 * @param actionType
 * @returns {string}
 */
export function humanizeActionType(actionType) {
    const EXCLUDED_WORDS = ['success']
    let words = actionType.toLowerCase().trim().split('_')
    // remove noise
    words = List(_.pullAll(words, EXCLUDED_WORDS))

    const verb = conjugateToPastSimple(words.get(0))
    words = words.shift()
    words = words.unshift(verb[0].toUpperCase() + verb.slice(1))
    return words.toJS().join(' ')
}
