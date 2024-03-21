import {Template} from 'models/widget/types'

import Customer from './Customer'
import Order from './Order'

const magento2 = (args: {template: Template}) => {
    const path = (args.template.absolutePath || []).join('.')

    if (path.match(/integrations\.[0-9]+\.customer$/)) {
        return Customer()
    }

    if (path.match(/integrations\.[0-9]+\.orders.\[]$/)) {
        return Order()
    }

    return {}
}

export default magento2
