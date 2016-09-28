import {template} from 'lodash'
import {formatDatetime} from '../../../utils'

// render a template like: `Order {self.id}` to `Order 37337`
export function renderTemplate(body, context = {}) {
    try {
        // So we can format the dates inside templates
        const newContext = context
        newContext.formatDatetime = formatDatetime

        return template(body, {
            interpolate: /{([\s\S]+?)}/g
        })(newContext)
    } catch (e) {
        return body
    }
}
