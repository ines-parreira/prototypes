// @flow
import _get from 'lodash/get'
import _isNull from 'lodash/isNull'
import _unescape from 'lodash/unescape'
import _trim from 'lodash/trim'
import moment from 'moment'

export const filterRegex = /([\w_]+)\(([^(]*)\)/
export const templateRegex = /{{([a-zA-Z0-9.\[\]"'_]+)\|?([\w_]+\([^(]*\))?}}/g

const filters = {
    datetime_format: (value: string, args: Array<string>): string => {
        if (!value) {
            return value
        }
        return moment(value).format(...args)
    },

    fallback: (value: string, args: Array<string>): string => {
        return _trim(value) ? value : args[0]
    },

    /* No support for relative datetimes at the moment
    datetime_relative: (value: string, args): string => {
        if (!value) {
            return value
        }
        return moment(value).fromNow(...args)
    },
    datetime_calendar: (value: string, args: Array): string => {
        if (!value) {
            return value
        }
        return moment(value).calendar(...args)
    },
    */
}

// render a template like: `Order {self.id}` to `Order 37337`
export const renderTemplate = (body: string, context: {} = {}): string => {
    if (!body) {
        return ''
    }

    return body.replace(templateRegex, (match: string, variable: string, filter: string): string => {
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
    })
}
