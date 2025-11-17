import type { Map } from 'immutable'

import { renderTemplate } from 'pages/common/utils/template'

export default function renderObject(
    argument: string | Map<any, any>,
    context: Record<string, string>,
) {
    let ret = argument

    if (typeof argument === 'string') {
        ret = renderTemplate(argument, context)
    } else if (typeof argument === 'object') {
        ret = argument.map((v) => renderObject(v, context)) as Map<any, any>
    }

    return ret
}
