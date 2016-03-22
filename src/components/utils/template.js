import { template } from 'lodash'

// render a template like: `Order {self.id}` to `Order 37337`
export function renderTemplate(body, context) {
    return template(body, {
        interpolate: /{([\s\S]+?)}/g
    })(context)
}