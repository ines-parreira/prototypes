import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as IntegrationsActions from '../../../state/integrations/actions'

import FacebookAvailablePages from './components/facebook/FacebookAvailablePages'
import FacebookPageDetail from './components/facebook/FacebookPageDetail'
import FacebookIntegrationList from './components/facebook/FacebookIntegrationList'

import HttpIntegrationList from './components/http/HttpIntegrationList'
import HttpIntegrationDetail from './components/http/HttpIntegrationDetail'

import SmoochIntegrationList from './components/smooch/SmoochIntegrationList'
import SmoochIntegrationDetail from './components/smooch/SmoochIntegrationDetail'

class IntegrationDetailContainer extends React.Component {
    componentWillMount() {
        this.props.actions.fetchIntegrations()

        // We need this to allow the user to refresh the settings page. If we don't fetch the state is empty on refresh.
        if (this.props.params.integrationId && this.props.params.integrationId !== 'new') {
            this.props.actions.fetchIntegration(this.props.params.integrationId)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.integrationId && nextProps.params.integrationId !== 'new' && this.props.params.integrationId !== nextProps.params.integrationId) {
            nextProps.actions.fetchIntegration(nextProps.params.integrationId)
        }
    }

    render() {
        const {
            integrations,
            actions,
            settings
        } = this.props

        if (!settings.get('loaded')) {
            return null
        }

        const isDetail = !!this.props.params.integrationId
        const isUpdate = isDetail && this.props.params.integrationId !== 'new'

        const commonProps = {
            integrations: integrations.get('integrations'),
            integration: integrations.get('integration'),
            facebookIntegrations: integrations.get('integrations').filter(integration => integration.get('type') === 'facebook'),
            facebookAppId: settings.getIn(['data', 'facebook_app_id']),
            loading: integrations.getIn(['state', 'loading']),
            actions
        }

        const {
            integrationType
        } = this.props.params

        if (!integrationType) {
            return null
        }

        let child = null
        switch (integrationType) {
            case 'facebook':
                if (isDetail) {
                    if (isUpdate) {
                        child = (
                            <FacebookPageDetail
                                actions={commonProps.actions}
                                integration={commonProps.integration}
                                loading={commonProps.loading}
                            />
                        )
                    } else {
                        child = (
                            <FacebookAvailablePages
                                actions={commonProps.actions}
                                facebookIntegrations={commonProps.facebookIntegrations}
                            />
                        )
                    }
                } else {
                    child = (
                        <FacebookIntegrationList
                            actions={commonProps.actions}
                            integrations={commonProps.integrations}
                            facebookAppId={commonProps.facebookAppId}
                            loading={commonProps.loading}
                            facebookLoginStatus={integrations.getIn(['_internal', 'facebookLoginStatus'])}
                        />
                    )
                }
                break

            case 'http':
                if (isDetail) {
                    child = (
                        <HttpIntegrationDetail
                            actions={commonProps.actions}
                            integration={commonProps.integration}
                            isUpdate={isUpdate}
                            loading={commonProps.loading}
                        />
                    )
                } else {
                    child = (
                        <HttpIntegrationList
                            actions={commonProps.actions}
                            integrations={commonProps.integrations}
                            loading={commonProps.loading}
                        />
                    )
                }
                break

            case 'smooch':
                if (isDetail) {
                    child = (
                        <SmoochIntegrationDetail
                            actions={commonProps.actions}
                            integration={commonProps.integration}
                            isUpdate={isUpdate}
                            loading={commonProps.loading}
                        />
                    )
                } else {
                    child = (
                        <SmoochIntegrationList
                            actions={commonProps.actions}
                            integrations={commonProps.integrations}
                            loading={commonProps.loading}
                        />
                    )
                }
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
    integrations: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        integrations: state.integrations,
        settings: state.settings
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(IntegrationsActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(IntegrationDetailContainer)
