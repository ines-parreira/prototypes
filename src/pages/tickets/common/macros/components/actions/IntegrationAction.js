import React from 'react'
import PropTypes from 'prop-types'

import {getIconFromType} from './../../../../../../state/integrations/helpers.ts'
import {getActionTemplate} from './../../../../../../utils'

class IntegrationAction extends React.Component {
    render() {
        const {action} = this.props

        const template = getActionTemplate(action.get('name'))
        const integrationType = template.integrationType

        return (
            <div className="d-flex align-items-center">
                <img
                    alt={`${integrationType} logo`}
                    role="presentation"
                    src={getIconFromType(integrationType)}
                    style={{maxWidth: '30px'}}
                    className="mr-2"
                />

                <b>{action.get('title')}</b>
            </div>
        )
    }
}

IntegrationAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
}

export default IntegrationAction
