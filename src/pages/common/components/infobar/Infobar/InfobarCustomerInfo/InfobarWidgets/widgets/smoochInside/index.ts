import {List, Map} from 'immutable'

import Root from './Root'

const smoochInside = (args: {
    template: Map<any, any>
    source: Map<any, any>
    parent: Map<any, any>
}) => {
    const path = (args.template.get('absolutePath', []) as List<string>).join(
        '.'
    )

    if (path.match(/integrations\.[0-9]+$/)) {
        return Root()
    }

    return {}
}

export default smoochInside
