import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as IntegrationsActions from '../../../state/integration/integration'

import FacebookPages from './components/facebook/FacebookPages'
import FacebookPageSettings from './components/facebook/FacebookPageSettings'
import FacebookIntegrationsEdit from './components/facebook/FacebookIntegrationsEdit'
import HttpIntegrationsEdit from './components/http/HttpIntegrationsEdit'

class IntegrationDetailContainer extends React.Component {
    componentWillMount() {
        this.props.actions.fetchIntegrations()

        // We need this to allow the user to refresh the settings page. If we don't fetch the state is empty on refresh.
        if (this.props.params.integrationId && this.props.params.integrationId !== 'new') {
            this.props.actions.fetchIntegration(this.props.params.integrationId)
        }
    }

    render() {
        const {integrationSettings, actions, settings} = this.props

        if (!settings.get('loaded')) {
            return null
        }

        const commonProps = {
            integrations: integrationSettings.get('integrations'),
            integration: integrationSettings.get('integration'),
            facebookIntegrations: integrationSettings.get('integrations').filter(integration => integration.get('type') === 'facebook'),
            facebookAppId: settings.getIn(['data', 'facebook_app_id']),
            loading: integrationSettings.getIn(['state', 'loading']),
            actions
        }

        const {integrationType, integrationId} = this.props.params

        if (!integrationType) {
            return null
        }

        let child = null
        switch (integrationType) {
            case 'facebook':
                if (integrationId && integrationId !== 'new') {
                    child = (<FacebookPageSettings actions={commonProps.actions} integration={commonProps.integration}
                                                   loading={commonProps.loading}
                    />)
                } else if (integrationId === 'new') {
                    child = (<FacebookPages
                        actions={commonProps.actions}
                        facebookIntegrations={commonProps.facebookIntegrations}
                    />)
                } else {
                    child = (<FacebookIntegrationsEdit
                        actions={commonProps.actions}
                        integrations={commonProps.integrations}
                        facebookAppId={commonProps.facebookAppId}
                        loading={commonProps.loading}
                    />)
                }
                break

            case 'http':
                child = (<HttpIntegrationsEdit actions={commonProps.actions}
                                               integrations={commonProps.integrations}
                                               loading={commonProps.loading}
                />)
                break
            default:
                child = null
        }

        return child
    }
}

IntegrationDetailContainer.propTypes = {
    params: PropTypes.shape({
        integrationType: PropTypes.string.isRequired,
        integrationId: PropTypes.string
    }).isRequired,
    integrationSettings: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired
}


function mapStateToProps(state) {
    return {
        integrationSettings: state.integrationSettings,
        settings: state.settings
    }
}


function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(IntegrationsActions, dispatch)
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(IntegrationDetailContainer)
