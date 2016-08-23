import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as IntegrationsActions from '../../../state/integration/integration'
import {getIntegrationsSummary} from '../../../state/integration/reducers'
import IntegrationsSummary from './components/IntegrationsSummary'

class IntegrationListContainer extends React.Component {
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

        return <IntegrationsSummary {...allProps} />
    }
}

IntegrationListContainer.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(IntegrationListContainer)
