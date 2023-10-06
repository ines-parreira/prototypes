import {List, Map} from 'immutable'

import Shopper from './Shopper'
import Order from './Order'

const woocommerce = (args: {
    template: Map<any, any>
    source: Map<any, any>
    parent: Map<any, any>
}) => {
    const path = (args.template.get('absolutePath', []) as List<string>).join(
        '.'
    )
    if (path.match(/ecommerce_data\..+\.shopper$/)) {
        return Shopper()
    }
    if (path.match(/ecommerce_data\..+\.orders\.\[]$/)) {
        return Order()
    }

    return {}
}

export default woocommerce
