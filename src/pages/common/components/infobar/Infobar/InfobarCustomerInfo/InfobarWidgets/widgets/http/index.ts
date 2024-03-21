import {Template} from 'models/widget/types'

import Root from './Root'

const http = (args: {template: Template}) => {
    const path = (args.template.absolutePath || []).join('.')
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
