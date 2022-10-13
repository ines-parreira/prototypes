import {List, Map} from 'immutable'

import Customer from './Customer'
import OrderWidget from './OrderWidget'
import Shipping from './Shipping'

const bigcommerce = (args: {
    template: Map<any, any>
    source: Map<any, any>
    parent: Map<any, any>
}) => {
    const path = (args.template.get('absolutePath', []) as List<string>).join(
        '.'
    )
    const templatePath: string = args.template.get('templatePath', '')

    if (path.match(/integrations\.\d+\.customer$/)) {
        return Customer()
    }

    if (
        path.match(/integrations\.\d+\.orders\.\[]$/) &&
        templatePath.match(/\d+\.template\.widgets\.\d+\.widgets\.\d+$/)
    ) {
        return OrderWidget()
    }

    if (
        path.match(/integrations\.\d+\.orders\.\[]\.bc_order_shipments\.\[]$/)
    ) {
        return Shipping()
    }

    return {}
}

export default bigcommerce
