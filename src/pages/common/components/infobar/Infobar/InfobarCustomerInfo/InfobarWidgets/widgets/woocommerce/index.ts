import {Template} from 'models/widget/types'

import Shopper from './Shopper'
import Order from './Order'

const woocommerce = (args: {template: Template}) => {
    const path = (args.template.absolutePath || []).join('.')
    if (path.match(/ecommerce_data\..+\.shopper$/)) {
        return Shopper()
    }
    if (path.match(/ecommerce_data\..+\.orders\.\[]$/)) {
        return Order()
    }

    return {}
}

export default woocommerce
