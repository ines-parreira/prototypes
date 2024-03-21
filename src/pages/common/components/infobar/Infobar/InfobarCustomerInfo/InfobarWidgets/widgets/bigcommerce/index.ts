import {Template} from 'models/widget/types'

import Customer from './Customer'
import OrderWidget from './OrderWidget'
import Shipping from './Shipping'

const bigcommerce = (args: {template: Template}) => {
    const path = (args.template.absolutePath || []).join('.')
    const templatePath = args.template.templatePath || ''

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
        path.match(/integrations\.\d+\.draft_orders\.\[]$/) &&
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
