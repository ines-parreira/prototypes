import {List, Map} from 'immutable'
import Root from './Root'

const http = (args: {
    template: Map<any, any>
    source: Map<any, any>
    parent: Map<any, any>
}) => {
    const path = (args.template.get('absolutePath', []) as List<string>).join(
        '.'
    )
    /** path must match when there is a root array / list too
     * OK
     * ticket.customer.integrations.10
     * ticket.customer.integrations.10.data
     * ticket.customer.integrations.10.[data]
     * KO
     * ticket.customer.integrations.10.data.[vdxvx]
     * ticket.customer.integrations.10.data.else
     */
    if (path.match(/integrations\.[0-9]+(\.[^.]+(\.\[])?)?$/)) {
        return Root()
    }

    return {}
}

export default http
