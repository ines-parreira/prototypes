import {List, Map} from 'immutable'

import Customer from './Customer'

const smile = (args: {
    template: Map<any, any>
    source: Map<any, any>
    parent: Map<any, any>
}) => {
    const path = (args.template.get('absolutePath', []) as List<string>).join(
        '.'
    )

    if (path.match(/integrations\.[0-9]+\.customer$/)) {
        return Customer()
    }

    return {}
}

export default smile
