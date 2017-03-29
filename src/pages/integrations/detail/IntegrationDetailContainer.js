import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS} from 'immutable'
import * as IntegrationsActions from '../../../state/integrations/actions'
import * as IntegrationsSelectors from '../../../state/integrations/selectors'

import FacebookIntegrationDetail from './components/facebook/FacebookIntegrationDetail'
import FacebookIntegrationList from './components/facebook/FacebookIntegrationList'
import FacebookIntegrationSetup from './components/facebook/FacebookIntegrationSetup'
import FacebookIntegrationLogin from './components/facebook/FacebookIntegrationLogin'

import HttpIntegrationList from './components/http/HttpIntegrationList'
import HttpIntegrationDetail from './components/http/HttpIntegrationDetail'

import ChatIntegrationList from './components/chat/ChatIntegrationList'
import ChatIntegrationDetail from './components/chat/ChatIntegrationDetail'

import SmoochIntegrationDetail from './components/smooch/SmoochIntegrationDetail'
import SmoochIntegrationList from './components/smooch/SmoochIntegrationList'

import ShopifyIntegrationList from './components/shopify/ShopifyIntegrationList'
import ShopifyIntegrationDetail from './components/shopify/ShopifyIntegrationDetail'

import EmailIntegrationList from './components/email/EmailIntegrationList'
import EmailIntegrationUpdate from './components/email/EmailIntegrationUpdate/index'
import EmailIntegrationCreate from './components/email/EmailIntegrationCreate/index'

class IntegrationDetailContainer extends React.Component {
    componentWillMount() {
        const {actions, params} = this.props
        actions.fetchIntegrations()

        // We need this to allow the user to refresh the settings page.
        // If we don't fetch it, the state is empty on refresh.
        if (params.integrationId && !['new', 'setup'].includes(params.integrationId)) {
            actions.fetchIntegration(params.integrationId, params.integrationType)
        }
    }

    componentWillReceiveProps(nextProps) {
        const {actions, params} = this.props
        const {params: nextParams} = nextProps
        if (
            nextParams.integrationId && !['new', 'setup'].includes(nextParams.integrationId) &&
            params.integrationId !== nextParams.integrationId
        ) {
            actions.fetchIntegration(nextParams.integrationId)
        }
    }

    render() {
        const {actions, integrations, params, settings, getFormValues, currentUser} = this.props

        if (!settings.get('loaded')) {
            return null
        }

        const isDetail = !!params.integrationId
        const isUpdate = isDetail && params.integrationId !== 'new'
        const isSetup = params.integrationId === 'setup'

        const commonProps = {
            integration: integrations.get('integration', fromJS({})),
            integrations: integrations.get('integrations', fromJS([])),
            loading: integrations.getIn(['state', 'loading'], fromJS({})),
        }

        const redirectUri = this.props.getRedirectUri(params.integrationType)

        switch (params.integrationType) {
            case 'email':
                if (isDetail) {
                    if (isUpdate) {
                        return (
                            <EmailIntegrationUpdate
                                actions={actions}
                                integration={commonProps.integration}
                                loading={commonProps.loading}
                            />
                        )
                    }

                    return (
                        <EmailIntegrationCreate
                            actions={actions}
                            loading={commonProps.loading}
                        />
                    )
                }

                return (
                    <EmailIntegrationList
                        actions={actions}
                        integrations={commonProps.integrations}
                        loading={commonProps.loading}
                    />
                )

            case 'facebook':
                if (isDetail) {
                    if (isSetup) {
                        return (
                            <FacebookIntegrationSetup
                                actions={actions}
                                integrations={commonProps.integrations}
                                loading={commonProps.loading}
                            />
                        )
                    } else if (isUpdate) {
                        return (
                            <FacebookIntegrationDetail
                                actions={actions}
                                integration={commonProps.integration}
                                loading={commonProps.loading}
                            />
                        )
                    }

                    return (
                        <FacebookIntegrationLogin
                            loading={commonProps.loading}
                            redirectUri={redirectUri}
                        />
                    )
                }

                return (
                    <FacebookIntegrationList
                        actions={actions}
                        integrations={commonProps.integrations}
                        redirectUri={redirectUri}
                        loading={commonProps.loading}
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
                }

                return (
                    <HttpIntegrationList
                        actions={actions}
                        integrations={commonProps.integrations}
                        loading={commonProps.loading}
                    />
                )

            case 'smooch_inside':
                if (isDetail) {
                    return (
                        <ChatIntegrationDetail
                            actions={actions}
                            integration={commonProps.integration}
                            isUpdate={isUpdate}
                            loading={commonProps.loading}
                            getFormValues={getFormValues}
                            currentUser={currentUser}
                        />
                    )
                }

                return (
                    <ChatIntegrationList
                        actions={actions}
                        integrations={commonProps.integrations}
                        loading={commonProps.loading}
                    />
                )

            case 'smooch':
                if (isDetail) {
                    return (
                        <SmoochIntegrationDetail
                            integration={commonProps.integration}
                            isUpdate={isUpdate}
                            actions={actions}
                            loading={commonProps.loading}
                            redirectUri={redirectUri}
                        />
                    )
                }

                return (
                    <SmoochIntegrationList
                        actions={actions}
                        integrations={commonProps.integrations}
                        loading={commonProps.loading}
                        redirectUri={redirectUri}
                    />
                )

            case 'shopify':
                if (isDetail) {
                    return (
                        <ShopifyIntegrationDetail
                            actions={actions}
                            integration={commonProps.integration}
                            isUpdate={isUpdate}
                            loading={commonProps.loading}
                            redirectUri={redirectUri}
                        />
                    )
                }

                return (
                    <ShopifyIntegrationList
                        actions={actions}
                        integrations={commonProps.integrations}
                        loading={commonProps.loading}
                    />
                )

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
    getRedirectUri: PropTypes.func.isRequired,
    getFormValues: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    integrations: state.integrations,
    settings: state.settings,
    getRedirectUri: IntegrationsSelectors.makeGetRedirectUri(state),
    currentUser: state.currentUser,
    getFormValues: IntegrationsSelectors.makeGetFormValues(state)
})

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(IntegrationsActions, dispatch),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(IntegrationDetailContainer)
