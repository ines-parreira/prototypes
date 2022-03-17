import _ from 'lodash'
import _unescape from 'lodash/unescape'
import _trim from 'lodash/trim'
import moment from 'moment'

import {Customer} from '../../../state/customers/types'
import {Ticket} from '../../../state/newMessage/types'

export const filterRegex = /([\w_]+)\(([^(]*)\)/
export const templateRegex =
    /{{([a-zA-Z0-9.\[\]"'_\-]+)\|?([\w_]+\([^(]*\))?}}/g
export const indexArrayRegex = /\[(?:\-)?\d+\]/
export const stringStartIndexArrayRegex = /^\[(?:\-)?\d+\]/

/**
 * Transforms a formatting string pattern in LDML to `moment.js` format.
 * LDML is the Unicode standard for date formatting patterns: https://unicode.org/reports/tr35/tr35-dates.html#Contents
 *
 * /!\ This function is not exhaustive and only replaces tokens which we currently use. Feel free to extend it.
 *
 */
export function LDMLToMomentFormat(pattern: string): string {
    return (
        pattern
            // Replace all `d` which are not immediately preceded or followed by another letter with `D`
            .replace(/(\bd\b)/g, 'D')
            // Replace all `dd` which are not immediately preceded or followed by another letter with `DD`
            .replace(/(\bdd\b)/g, 'DD')
    )
}

const filters = {
    datetime_format: (value: string, args: Array<string>): string => {
        if (!value) {
            return value
        }

        let pattern = args[0]
        pattern = LDMLToMomentFormat(pattern)
        return moment(value).format(pattern)
    },

    fallback: (value: string, args: Array<string>): string => {
        return _trim(value) ? value : args[0]
    },
}

export type Context = {
    [key: string]: unknown
    ticket?: Omit<Ticket, 'state' | '_internal'>
    user?: Customer | Record<string, never>
}

/**
 * Render a template like: `Order {self.id}` to `Order 37337`
 */
export const renderTemplate = (
    body?: Maybe<string>,
    context: Context = {}
): string => {
    if (!body) {
        return ''
    }

    return body.replace(
        templateRegex,
        (match: string, variable: string, filter: string): string => {
            try {
                let tempVariable = variable
                let obj = _.chain(context)
                variable.split(indexArrayRegex).forEach((path) => {
                    const rex = new RegExp('^' + _.escapeRegExp(path))
                    tempVariable = tempVariable.replace(rex, '')

                    // @ts-ignore
                    obj = obj.get(_.trimStart(path, '.'))
                    const index = tempVariable.match(stringStartIndexArrayRegex)
                    if (index) {
                        // @ts-ignore
                        obj = obj.nth(_trim(index[0], '[]')) // eslint-disable-line
                        tempVariable = _.trimStart(tempVariable, index[0])
                    }
                })

                // @ts-ignore
                let value = obj.value() as string
                value = _.isNil(value) ? '' : value

                if (filter) {
                    const filterMatch = filterRegex.exec(filter)
                    if (!filterMatch) {
                        return value
                    }
                    const filterFunc = filterMatch[1] as keyof typeof filters
                    const filterArgs = eval(`[${_unescape(filterMatch[2])}]`)
                    if (typeof filters[filterFunc] !== 'function') {
                        return value
                    }
                    value = filters[filterFunc](value, filterArgs)
                }
                return value
            } catch (e) {
                console.error('Failed to render template', match, variable, e)
                return ''
            }
        }
    )
}
