import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as IntegrationsActions from '../actions/integration'


import FacebookPages from '../components/integration/facebook/FacebookPages'
import FacebookPageSettings from '../components/integration/facebook/FacebookPageSettings'
import FacebookIntegrationsEdit from '../components/integration/facebook/FacebookIntegrationsEdit'
import HttpIntegrationsEdit from '../components/integration/http/HttpIntegrationsEdit'

class IntegrationsContainer extends React.Component {
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

        const allProps = {
            integrations: integrationSettings.get('integrations'),
            integration: integrationSettings.get('integration'),
            facebookIntegrations: integrationSettings.get('integrations').filter(integration => integration.get('type') === 'facebook'),
            facebookAppId: settings.getIn(['data', 'facebook_app_id']),
            loading: integrationSettings.getIn(['state', 'loadingIntegrations']),
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
                    child = <FacebookPageSettings actions={allProps.actions} integration={allProps.integration}/>
                } else if (integrationId === 'new') {
                    child = (<FacebookPages
                        actions={allProps.actions}
                        facebookIntegrations={allProps.facebookIntegrations}
                    />)
                } else {
                    child = (<FacebookIntegrationsEdit
                        actions={allProps.actions}
                        integrations={allProps.integrations}
                        facebookAppId={allProps.facebookAppId}
                        loading={allProps.loading}
                    />)
                }
                break;

            case 'http':
                child = (<HttpIntegrationsEdit actions={allProps.actions}
                                              integrations={allProps.integrations}
                                              loading={allProps.loading}
                />)
                break;
            default:
                child = null
        }

        return child
    }
}


IntegrationsContainer.propTypes = {
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


export default connect(mapStateToProps, mapDispatchToProps)(IntegrationsContainer)
