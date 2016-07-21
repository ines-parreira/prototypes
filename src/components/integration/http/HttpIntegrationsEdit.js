import React, {PropTypes} from 'react'
import IntegrationsEdit from '../IntegrationsEdit'

export default class FacebookIntegrationsEdit extends React.Component {
    render() {
        const {integrations, actions} = this.props

        const longTypeDescription = 'HTTP integrations allow you to connect Gorgias to about anything with HTTP bindings.'

        const integrationToItemDisplay = (int) => {
            if (int.get('deactivated_datetime')) {
                return null
            }

            return <div key={int.get('id')}>{int.get('name')}</div>
        }

        return (
            <IntegrationsEdit
                integrationType="http"
                integrations={integrations.filter((v) => v.get('type') === 'http')}
                longTypeDescription={longTypeDescription}
                createIntegration={actions.createHttpIntegration}
                createIntegrationButtonText="ADD HTTP INTEGRATION"
                integrationToItemDisplay={integrationToItemDisplay}
            />
        )
    }
}


FacebookIntegrationsEdit.propTypes = {
    // An object that contains the integrations for the relevant type along with display info.
    integrations: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
