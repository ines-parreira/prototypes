import {List, Map} from 'immutable'

import Shopper from './Shopper'

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

    return {}
}

export default woocommerce
