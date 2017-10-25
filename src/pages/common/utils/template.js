// @flow
import _get from 'lodash/get'
import _isNull from 'lodash/isNull'

export const templateRegex = /{{([a-zA-Z0-9.\[\]"'_]+)}}/g

// render a template like: `Order {self.id}` to `Order 37337`
export const renderTemplate = (body: string, context: {} = {}): string => {
    if (!body) {
        return ''
    }

    return body.replace(templateRegex, (match, path) => {
        try {
            const value = _get(context, path, '')
            return _isNull(value) ? '' : value
        } catch (e) {
            return ''
        }
    })
}
