import _get from 'lodash/get'

export const templateRegex = /{([a-zA-Z0-9.\[\]"'_]+)}/g

// render a template like: `Order {self.id}` to `Order 37337`
export const renderTemplate = (body, context = {}) => {
    return body.replace(templateRegex, (match, path) => {
        try {
            return _get(context, path, '') || '' // replaces null values too
        } catch (e) {
            return ''
        }
    })
}
