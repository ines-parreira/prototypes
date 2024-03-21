import {Template} from 'models/widget/types'

import Customer from './Customer'
import ReviewStatistics from './ReviewStatistics'
import Loyalty from './Loyalty'
import Reviews from './Reviews'

const yotpo = (args: {template: Template}) => {
    const path = (args.template.absolutePath || []).join('.')

    if (path.match(/integrations\.[0-9]+\.customer$/)) {
        return Customer()
    }

    if (path.match(/integrations\.[0-9]+\.customer\.loyalty_statistics$/)) {
        return Loyalty()
    }

    if (path.match(/integrations\.[0-9]+\.customer\.reviews_statistics$/)) {
        return ReviewStatistics()
    }

    if (path.match(/integrations\.[0-9]+\.reviews\.\[]$/)) {
        return Reviews()
    }

    return {}
}

export default yotpo
