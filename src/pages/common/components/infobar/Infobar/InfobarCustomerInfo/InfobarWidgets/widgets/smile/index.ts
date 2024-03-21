import {Template} from 'models/widget/types'

import Customer from './Customer'

const smile = (args: {template: Template}) => {
    const path = (args.template.absolutePath || []).join('.')

    if (path.match(/integrations\.[0-9]+\.customer$/)) {
        return Customer()
    }

    return {}
}

export default smile
