import {List, Map} from 'immutable'

import Customer from './Customer'
import ReviewStatistics from './ReviewStatistics'
import Loyalty from './Loyalty'
import Reviews from './Reviews'

const yotpo = (args: {
    template: Map<any, any>
    isEditing: boolean
    source: unknown
}) => {
    const path = (args.template.get('absolutePath', []) as List<string>).join(
        '.'
    )

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
