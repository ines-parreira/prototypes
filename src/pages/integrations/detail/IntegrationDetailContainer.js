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
        const {actions, params} = this.props
        actions.fetchIntegrations()

        // We need this to allow the user to refresh the settings page.
        // If we don't fetch it, the state is empty on refresh.
        if (params.integrationId && params.integrationId !== 'new') {
            actions.fetchIntegration(params.integrationId, params.integrationType)
        }
    }

    componentWillReceiveProps(nextProps) {
        const {actions, params} = this.props
        const {params: nextParams} = nextProps
        if (
            nextParams.integrationId &&
            nextParams.integrationId !== 'new' &&
            params.integrationId !== nextParams.integrationId
        ) {
            actions.fetchIntegration(nextParams.integrationId)
        }
    }

    render() {
        const {actions, integrations, params, settings} = this.props

        if (!settings.get('loaded')) {
            return null
        }

        const isDetail = !!params.integrationId
        const isUpdate = isDetail && params.integrationId !== 'new'
        const commonProps = {
            integration: integrations.get('integration'),
            integrations: integrations.get('integrations'),
            loading: integrations.getIn(['state', 'loading']),
        }

        switch (params.integrationType) {
            case 'facebook':
                if (isDetail) {
                    if (isUpdate) {
                        return (
                            <FacebookPageDetail
                                actions={actions}
                                integration={commonProps.integration}
                                loading={commonProps.loading}
                            />
                        )
                    }

                    const facebookIntegrations = commonProps.integrations.filter(i => i.get('type') === 'facebook')
                    return (
                        <FacebookAvailablePages
                            actions={actions}
                            facebookIntegrations={facebookIntegrations}
                        />
                    )
                }

                return (
                    <FacebookIntegrationList
                        actions={actions}
                        integrations={commonProps.integrations}
                        facebookAppId={settings.getIn(['data', 'facebook_app_id'])}
                        loading={commonProps.loading}
                        facebookLoginStatus={integrations.getIn(['_internal', 'facebookLoginStatus'])}
                    />
                )

            case 'http':
                if (isDetail) {
                    return (
                        <HttpIntegrationDetail
                            actions={actions}
                            integration={commonProps.integration}
                            isUpdate={isUpdate}
                            loading={commonProps.loading}
                        />
                    )
                } else {
                    return (
                        <HttpIntegrationList
                            actions={actions}
                            integrations={commonProps.integrations}
                            loading={commonProps.loading}
                        />
                    )
                }

            case 'smooch':
                if (isDetail) {
                    return (
                        <SmoochIntegrationDetail
                            actions={actions}
                            integration={commonProps.integration}
                            isUpdate={isUpdate}
                            loading={commonProps.loading}
                        />
                    )
                } else {
                    return (
                        <SmoochIntegrationList
                            actions={actions}
                            integrations={commonProps.integrations}
                            loading={commonProps.loading}
                        />
                    )
                }

            default:
                return null
        }
    }
}

IntegrationDetailContainer.propTypes = {
    actions: PropTypes.object.isRequired,
    integrations: PropTypes.object.isRequired,
    params: PropTypes.shape({
        integrationType: PropTypes.string.isRequired,
        integrationId: PropTypes.string
    }).isRequired,
    settings: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
    integrations: state.integrations,
    settings: state.settings,
})

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(IntegrationsActions, dispatch),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(IntegrationDetailContainer)
