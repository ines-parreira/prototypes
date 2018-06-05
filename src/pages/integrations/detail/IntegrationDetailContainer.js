import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS} from 'immutable'

import {compare} from '../../../utils'

import * as IntegrationsActions from '../../../state/integrations/actions'
import * as IntegrationsSelectors from '../../../state/integrations/selectors'

import AircallIntegrationList from './components/aircall/AircallIntegrationList'
import AircallIntegrationCreate from './components/aircall/AircallIntegrationCreate'

import FacebookIntegrationDetail from './components/facebook/FacebookIntegrationDetail'
import FacebookIntegrationList from './components/facebook/FacebookIntegrationList'
import FacebookIntegrationSetup from './components/facebook/FacebookIntegrationSetup'
import FacebookIntegrationLogin from './components/facebook/FacebookIntegrationLogin'

import HTTPIntegrationList from './components/http/HTTPIntegrationList'

import ChatIntegrationList from './components/chat/ChatIntegrationList'
import ChatIntegrationAppearance from './components/chat/ChatIntegrationAppearance'
import RealtimeMessagingIntegrationInstall from './../common/RealtimeMessagingIntegrationInstall'
import RealtimeMessagingIntegrationPreferences from './../common/RealtimeMessagingIntegrationPreferences'

import SmoochIntegrationDetail from './components/smooch/SmoochIntegrationDetail'
import SmoochIntegrationList from './components/smooch/SmoochIntegrationList'

import ShopifyIntegrationList from './components/shopify/ShopifyIntegrationList'
import ShopifyIntegrationDetail from './components/shopify/ShopifyIntegrationDetail'

import RechargeIntegrationList from './components/recharge/RechargeIntegrationList'
import RechargeIntegrationDetail from './components/recharge/RechargeIntegrationDetail'

import EmailIntegrationList from './components/email/EmailIntegrationList'
import EmailIntegrationUpdate from './components/email/EmailIntegrationUpdate/index'
import EmailIntegrationCreate from './components/email/EmailIntegrationCreate/index'
import EmailIntegrationCreateForwarding from './components/email/EmailIntegrationCreateForwarding/index'
import EmailIntegrationCreateVerification from './components/email/EmailIntegrationCreateVerification'
import ChatIntegrationCampaigns from './components/chat/ChatIntegrationCampaigns/ChatIntegrationCampaigns'
import CampaignDetail from './components/chat/ChatIntegrationCampaigns/CampaignDetail/CampaignDetail'
import HTTPIntegrationOverview from './components/http/HTTPIntegrationOverview/HTTPIntegrationOverview'
import HTTPIntegrationEvents from './components/http/HTTPIntegrationEvents'
import HTTPIntegrationEvent from './components/http/HTTPIntegrationEvent'
import HTTPIntegrationLayout from './components/http/HTTPIntegrationLayout/HTTPIntegrationLayout'


class IntegrationDetailContainer extends React.Component {
    componentWillMount() {
        const {actions, params} = this.props
        actions.fetchIntegrations(true)

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
        const {actions, integrations, params, currentUser} = this.props

        const isDetail = !!params.integrationId
        const isUpdate = isDetail && params.integrationId !== 'new'
        const isSetup = params.integrationId === 'setup'
        const isForwarding = params.extra === 'forwarding'
        const isVerification = params.extra === 'verification'
        let integration = integrations.get('integration', fromJS({}))

        // clear cached integration
        if (integration.get('id', '').toString() !== params.integrationId) {
            integration = fromJS({})
        }

        const commonProps = {
            integration: integration,
            integrations: integrations.get('integrations', fromJS([]))
                .sort((a, b) => compare((a.get('name') || '').toLowerCase(), (b.get('name') || '').toLowerCase())),
            loading: integrations.getIn(['state', 'loading'], fromJS({})),
        }

        const redirectUri = this.props.getRedirectUri(params.integrationType)

        switch (params.integrationType) {
            case 'aircall':
                if (isDetail) {
                    return (
                        <AircallIntegrationCreate/>
                    )
                }
                return (
                    <AircallIntegrationList
                        integrations={commonProps.integrations}
                        loading={commonProps.loading}
                    />
                )

            case 'email':
                if (isDetail) {
                    if (isUpdate) {
                        if (isForwarding) {
                            return (
                                <EmailIntegrationCreateForwarding
                                    actions={actions}
                                    integration={commonProps.integration}
                                />
                            )
                        }

                        if (isVerification) {
                            return (
                                <EmailIntegrationCreateVerification
                                    actions={actions}
                                    integration={commonProps.integration}
                                />
                            )
                        }

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
                                loading={commonProps.loading}
                            />
                        )
                    }

                    if (params.extra === 'customer_chat') {
                        return (
                            <RealtimeMessagingIntegrationInstall
                                actions={actions}
                                loading={commonProps.loading}
                                integration={commonProps.integration}
                            />
                        )
                    }

                    if (isUpdate) {
                        if (params.extra === 'preferences') {
                            return (
                                <RealtimeMessagingIntegrationPreferences
                                    actions={actions}
                                    loading={commonProps.loading}
                                    integration={commonProps.integration}
                                />
                            )
                        }

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
                        redirectUri={redirectUri}
                        loading={commonProps.loading}
                    />
                )

            case 'http':
                if (isDetail) {
                    if (params.extra === 'events') {
                        if (params.subId) {
                            return (
                                <HTTPIntegrationLayout
                                    integration={integration}
                                    isUpdate={isUpdate}
                                    urlParams={params}
                                >
                                    <HTTPIntegrationEvent
                                        integrationId={params.integrationId}
                                        eventId={params.subId}
                                    />
                                </HTTPIntegrationLayout>
                            )
                        }

                        return (
                            <HTTPIntegrationLayout
                                integration={integration}
                                isUpdate={isUpdate}
                                urlParams={params}
                            >
                                <HTTPIntegrationEvents integrationId={params.integrationId}/>
                            </HTTPIntegrationLayout>

                        )
                    }

                    return (
                        <HTTPIntegrationLayout
                            integration={integration}
                            isUpdate={isUpdate}
                            urlParams={params}
                        >
                            <HTTPIntegrationOverview
                                actions={actions}
                                integration={commonProps.integration}
                                isUpdate={isUpdate}
                                loading={commonProps.loading}
                            />
                        </HTTPIntegrationLayout>
                    )
                }

                return (
                    <HTTPIntegrationList
                        actions={actions}
                        integrations={commonProps.integrations}
                        loading={commonProps.loading}
                    />
                )

            case 'smooch_inside':
                if (isDetail) {
                    if (params.extra === 'installation') {
                        return (
                            <RealtimeMessagingIntegrationInstall
                                actions={actions}
                                loading={commonProps.loading}
                                integration={commonProps.integration}
                            />
                        )
                    }

                    if (params.extra === 'preferences') {
                        return (
                            <RealtimeMessagingIntegrationPreferences
                                actions={actions}
                                loading={commonProps.loading}
                                integration={commonProps.integration}
                            />
                        )
                    }

                    if (params.extra === 'campaigns') {
                        if (params.subId) {
                            return (
                                <CampaignDetail
                                    integration={commonProps.integration}
                                    id={params.subId}
                                />
                            )
                        }

                        return (
                            <ChatIntegrationCampaigns
                                actions={actions}
                                loading={commonProps.loading}
                                integration={commonProps.integration}
                            />
                        )
                    }

                    return (
                        <ChatIntegrationAppearance
                            actions={actions}
                            integration={commonProps.integration}
                            isUpdate={isUpdate}
                            loading={commonProps.loading}
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
                    if (params.extra === 'preferences') {
                        return (
                            <RealtimeMessagingIntegrationPreferences
                                actions={actions}
                                loading={commonProps.loading}
                                integration={commonProps.integration}
                            />
                        )
                    }

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

            case 'recharge':
                if (isDetail) {
                    return (
                        <RechargeIntegrationDetail
                            actions={actions}
                            integration={commonProps.integration}
                            isUpdate={isUpdate}
                            loading={commonProps.loading}
                            redirectUri={redirectUri}
                        />
                    )
                }

                return (
                    <RechargeIntegrationList
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
    getRedirectUri: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    integrations: state.integrations,
    getRedirectUri: IntegrationsSelectors.makeGetRedirectUri(state),
    currentUser: state.currentUser
})

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(IntegrationsActions, dispatch),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(IntegrationDetailContainer)
