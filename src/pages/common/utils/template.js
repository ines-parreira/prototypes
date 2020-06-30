// @flow
import _get from 'lodash/get'
import _isNull from 'lodash/isNull'
import _unescape from 'lodash/unescape'
import _trim from 'lodash/trim'
import moment from 'moment'

export const filterRegex = /([\w_]+)\(([^(]*)\)/
export const templateRegex = /{{([a-zA-Z0-9.\[\]"'_]+)\|?([\w_]+\([^(]*\))?}}/g

/**
 * Transforms a formatting string pattern in LDML to `moment.js` format.
 * LDML is the Unicode standard for date formatting patterns: https://unicode.org/reports/tr35/tr35-dates.html#Contents
 *
 * /!\ This function is not exhaustive and only replaces tokens which we currently use. Feel free to extend it.
 *
 * @param pattern: the LDML pattern to transform
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

/**
 * Render a template like: `Order {self.id}` to `Order 37337`
 * @param body: the text in which to replace variables
 * @param context: the context containing values to render the body
 * @returns {string}: the body rendered with values from the context
 */
export const renderTemplate = (body: string, context: {} = {}): string => {
    if (!body) {
        return ''
    }

    return body.replace(
        templateRegex,
        (match: string, variable: string, filter: string): string => {
            try {
                let value = _get(context, variable, '')
                value = _isNull(value) ? '' : value

                if (filter) {
                    const filterMatch = filter.match(filterRegex)
                    if (!filterMatch) {
                        return value
                    }
                    const filterFunc = filterMatch[1]
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
