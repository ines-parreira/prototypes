import { Component } from 'react'

import type { Map } from 'immutable'

import type { IntegrationType } from 'models/integration/constants'
import { getIconFromType } from 'state/integrations/helpers'
import { getActionTemplate } from 'utils'

type Props = {
    action: Map<string, any>
    index: number
}

class IntegrationAction extends Component<Props> {
    render() {
        const { action } = this.props

        const template = getActionTemplate(action.get('name'))
        const integrationType = template!.integrationType as IntegrationType

        return (
            <div className="d-flex align-items-center">
                <img
                    alt={`${integrationType} logo`}
                    role="presentation"
                    src={getIconFromType(integrationType)}
                    style={{ maxWidth: '30px' }}
                    className="mr-2"
                />

                <b>{action.get('title')}</b>
            </div>
        )
    }
}

export default IntegrationAction
