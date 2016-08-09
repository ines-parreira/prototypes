import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as IntegrationsActions from '../actions/integration'
import {getIntegrationsSummary} from '../reducers/integrationSettings'


import IntegrationsSummary from '../components/integration/IntegrationsSummary'

class IntegrationsSummaryContainer extends React.Component {
    componentWillMount() {
        this.props.actions.fetchIntegrations()
    }

    render() {
        const {integrationSettings, actions, settings} = this.props

        if (!settings.get('loaded')) {
            return null
        }

        const allProps = {
            integrationsSummary: getIntegrationsSummary(integrationSettings.get('integrations')),
            facebookAppId: settings.getIn(['data', 'facebook_app_id']),
            typeToLoadingStatus: {facebook: integrationSettings.getIn(['state', 'loading', 'facebookLogin'])},
            actions
        }

        return <IntegrationsSummary {...allProps}/>
    }
}

IntegrationsSummaryContainer.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(IntegrationsSummaryContainer)
