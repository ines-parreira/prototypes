import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS} from 'immutable'

import {
    AIRCALL_INTEGRATION_TYPE,
    EMAIL_INTEGRATION_TYPE,
    FACEBOOK_INTEGRATION_TYPE,
    GMAIL_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
    GORGIAS_CHAT_INTEGRATION_TYPE,
    HTTP_INTEGRATION_TYPE,
    MAGENTO2_INTEGRATION_TYPE,
    RECHARGE_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
    SMILE_INTEGRATION_TYPE,
    SMOOCH_INSIDE_INTEGRATION_TYPE,
    SMOOCH_INTEGRATION_TYPE,
} from '../../../constants/integration.ts'

import {compare} from '../../../utils.ts'

import * as IntegrationsActions from '../../../state/integrations/actions.ts'
import * as IntegrationsSelectors from '../../../state/integrations/selectors.ts'

import AircallIntegrationList from './components/aircall/AircallIntegrationList'
import AircallIntegrationCreate from './components/aircall/AircallIntegrationCreate'

import OutlookIntegrationSetup from './components/email/outlook/OutlookIntegrationSetup'

import FacebookIntegrationDetail from './components/facebook/FacebookIntegrationDetail'
import FacebookIntegrationList from './components/facebook/FacebookIntegrationList'
import FacebookIntegrationPreferences from './components/facebook/FacebookIntegrationPreferences'
import FacebookIntegrationInstagramAds from './components/facebook/FacebookIntegrationAds'
import FacebookIntegrationSetup from './components/facebook/FacebookIntegrationSetup'
import FacebookIntegrationCustomerChat from './components/facebook/FacebookIntegrationCustomerChat'

import GorgiasChatIntegrationAppearance from './components/gorgias_chat/GorgiasChatIntegrationAppearance/GorgiasChatIntegrationAppearance'
import GorgiasChatCampaignDetail from './components/gorgias_chat/GorgiasChatIntegrationCampaigns/GorgiasChatCampaignDetail'
import GorgiasChatIntegrationCampaigns from './components/gorgias_chat/GorgiasChatIntegrationCampaigns/GorgiasChatIntegrationCampaigns'
import GorgiasChatIntegrationInstall from './components/gorgias_chat/GorgiasChatIntegrationInstall'
import GorgiasChatIntegrationList from './components/gorgias_chat/GorgiasChatIntegrationList'
import GorgiasChatIntegrationPreferences from './components/gorgias_chat/GorgiasChatIntegrationPreferences'
import GorgiasChatIntegrationQuickReplies from './components/gorgias_chat/GorgiasChatIntegrationQuickReplies'

import HTTPIntegrationList from './components/http/HTTPIntegrationList'

import Magento2IntegrationDetail from './components/magento2/Magento2IntegrationDetail'
import Magento2IntegrationList from './components/magento2/Magento2IntegrationList'

import SmoochIntegrationDetail from './components/smooch/SmoochIntegrationDetail'
import SmoochIntegrationList from './components/smooch/SmoochIntegrationList'
import SmoochIntegrationPreferences from './components/smooch/SmoochIntegrationPreferences'

import ShopifyIntegrationList from './components/shopify/ShopifyIntegrationList'
import ShopifyIntegrationDetail from './components/shopify/ShopifyIntegrationDetail'

import RechargeIntegrationList from './components/recharge/RechargeIntegrationList'
import RechargeIntegrationDetail from './components/recharge/RechargeIntegrationDetail'

import SmileIntegrationList from './components/smile/SmileIntegrationList'
import SmileIntegrationDetail from './components/smile/SmileIntegrationDetail'

import EmailIntegrationList from './components/email/EmailIntegrationList'
import EmailIntegrationUpdate from './components/email/EmailIntegrationUpdate/index'
import EmailIntegrationCreate from './components/email/EmailIntegrationCreate/index'
import EmailIntegrationCreateForwarding from './components/email/EmailIntegrationCreateForwarding/index'
import EmailIntegrationCreateVerification from './components/email/EmailIntegrationCreateVerification'

import ChatIntegrationList from './components/chat/ChatIntegrationList'
import ChatIntegrationAppearance from './components/chat/ChatIntegrationAppearance'
import ChatIntegrationCampaigns from './components/chat/ChatIntegrationCampaigns/ChatIntegrationCampaigns'
import ChatIntegrationQuickReplies from './components/chat/ChatIntegrationQuickReplies'
import ChatIntegrationPreferences from './components/chat/ChatIntegrationPreferences'
import ChatIntegrationInstall from './components/chat/ChatIntegrationInstall'
import CampaignDetail from './components/chat/ChatIntegrationCampaigns/CampaignDetail'

import HTTPIntegrationOverview from './components/http/HTTPIntegrationOverview/HTTPIntegrationOverview'
import HTTPIntegrationEvents from './components/http/HTTPIntegrationEvents'
import HTTPIntegrationEvent from './components/http/HTTPIntegrationEvent'
import HTTPIntegrationLayout from './components/http/HTTPIntegrationLayout/HTTPIntegrationLayout'
import EmailIntegrationCreateCustom from './components/email/EmailIntegrationCreateCustom/EmailIntegrationCreateCustom'

class IntegrationDetailContainer extends React.Component {
    componentWillMount() {
        const {actions, params} = this.props
        actions.fetchIntegrations()

        // We need this to allow the user to refresh the settings page.
        // If we don't fetch it, the state is empty on refresh.
        if (
            params.integrationId &&
            !['new', 'setup'].includes(params.integrationId)
        ) {
            actions.fetchIntegration(
                params.integrationId,
                params.integrationType
            )
        }
    }

    componentWillReceiveProps(nextProps) {
        const {actions, params} = this.props
        const {params: nextParams} = nextProps
        if (
            nextParams.integrationId &&
            !['new', 'setup'].includes(nextParams.integrationId) &&
            params.integrationId !== nextParams.integrationId
        ) {
            actions.fetchIntegration(nextParams.integrationId)
        }
    }

    render() {
        const {
            actions,
            currentUser,
            integrations,
            getEligibleShopifyIntegrationsFor,
            getRedirectUri,
            params,
        } = this.props

        const isDetail = !!params.integrationId
        const isUpdate = isDetail && params.integrationId !== 'new'
        const isSetup = params.integrationId === 'setup'
        let integration = integrations.get('integration', fromJS({}))

        // clear cached integration
        if (integration.get('id', '').toString() !== params.integrationId) {
            integration = fromJS({})
        }

        const commonProps = {
            integration: integration,
            integrations: integrations
                .get('integrations', fromJS([]))
                .sort((a, b) =>
                    compare(
                        (a.get('name') || '').toLowerCase(),
                        (b.get('name') || '').toLowerCase()
                    )
                ),
            loading: integrations.getIn(['state', 'loading'], fromJS({})),
        }

        const redirectUri = getRedirectUri(params.integrationType)

        switch (params.integrationType) {
            case AIRCALL_INTEGRATION_TYPE:
                if (isDetail) {
                    return <AircallIntegrationCreate />
                }
                return (
                    <AircallIntegrationList
                        integrations={commonProps.integrations}
                        loading={commonProps.loading}
                    />
                )

            case EMAIL_INTEGRATION_TYPE:
                if (isDetail) {
                    if (isSetup) {
                        return (
                            <OutlookIntegrationSetup
                                actions={actions}
                                loading={commonProps.loading}
                            />
                        )
                    }

                    if (isUpdate) {
                        if (params.extra === 'forwarding') {
                            return (
                                <EmailIntegrationCreateForwarding
                                    actions={actions}
                                    integration={commonProps.integration}
                                />
                            )
                        }

                        if (params.extra === 'verification') {
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

                    if (params.extra === 'custom') {
                        return (
                            <EmailIntegrationCreateCustom
                                actions={actions}
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
                        gmailRedirectUri={getRedirectUri(
                            GMAIL_INTEGRATION_TYPE
                        )}
                        outlookRedirectUri={getRedirectUri(
                            OUTLOOK_INTEGRATION_TYPE
                        )}
                    />
                )

            case FACEBOOK_INTEGRATION_TYPE:
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
                            <FacebookIntegrationCustomerChat
                                actions={actions}
                                loading={commonProps.loading}
                                integration={commonProps.integration}
                            />
                        )
                    }

                    if (params.extra === 'preferences') {
                        return (
                            <FacebookIntegrationPreferences
                                actions={actions}
                                loading={commonProps.loading}
                                integration={commonProps.integration}
                            />
                        )
                    }

                    if (params.extra === 'ads') {
                        return (
                            <FacebookIntegrationInstagramAds
                                integrations={commonProps.integrations}
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
                    <FacebookIntegrationList
                        actions={actions}
                        redirectUri={redirectUri}
                        loading={commonProps.loading}
                    />
                )

            case HTTP_INTEGRATION_TYPE:
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
                                <HTTPIntegrationEvents
                                    integrationId={params.integrationId}
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

            case GORGIAS_CHAT_INTEGRATION_TYPE:
                if (isDetail) {
                    if (params.extra === 'installation') {
                        return (
                            <GorgiasChatIntegrationInstall
                                actions={actions}
                                loading={commonProps.loading}
                                integration={commonProps.integration}
                            />
                        )
                    }

                    if (params.extra === 'preferences') {
                        return (
                            <GorgiasChatIntegrationPreferences
                                actions={actions}
                                loading={commonProps.loading}
                                integration={commonProps.integration}
                            />
                        )
                    }

                    if (params.extra === 'quick_replies') {
                        return (
                            <GorgiasChatIntegrationQuickReplies
                                integration={commonProps.integration}
                            />
                        )
                    }

                    if (params.extra === 'campaigns') {
                        if (params.subId) {
                            return (
                                <GorgiasChatCampaignDetail
                                    integration={commonProps.integration}
                                    id={params.subId}
                                />
                            )
                        }

                        return (
                            <GorgiasChatIntegrationCampaigns
                                integration={commonProps.integration}
                            />
                        )
                    }

                    return (
                        <GorgiasChatIntegrationAppearance
                            actions={actions}
                            integration={commonProps.integration}
                            isUpdate={isUpdate}
                            loading={commonProps.loading}
                            currentUser={currentUser}
                        />
                    )
                }

                return (
                    <GorgiasChatIntegrationList
                        actions={actions}
                        integrations={commonProps.integrations}
                        loading={commonProps.loading}
                    />
                )

            case SMOOCH_INSIDE_INTEGRATION_TYPE:
                if (isDetail) {
                    if (params.extra === 'installation') {
                        return (
                            <ChatIntegrationInstall
                                actions={actions}
                                loading={commonProps.loading}
                                integration={commonProps.integration}
                            />
                        )
                    }

                    if (params.extra === 'preferences') {
                        return (
                            <ChatIntegrationPreferences
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
                                integration={commonProps.integration}
                            />
                        )
                    }

                    if (params.extra === 'quick-replies') {
                        return (
                            <ChatIntegrationQuickReplies
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

            case SMOOCH_INTEGRATION_TYPE:
                if (isDetail) {
                    if (params.extra === 'preferences') {
                        return (
                            <SmoochIntegrationPreferences
                                actions={actions}
                                loading={commonProps.loading}
                                integration={commonProps.integration}
                            />
                        )
                    }

                    return (
                        <SmoochIntegrationDetail
                            integration={commonProps.integration}
                            actions={actions}
                            loading={commonProps.loading}
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

            case SHOPIFY_INTEGRATION_TYPE:
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
                        redirectUri={redirectUri}
                    />
                )

            case RECHARGE_INTEGRATION_TYPE:
                if (isDetail) {
                    return (
                        <RechargeIntegrationDetail
                            actions={actions}
                            integration={commonProps.integration}
                            shopifyIntegrations={getEligibleShopifyIntegrationsFor(
                                RECHARGE_INTEGRATION_TYPE
                            )}
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
                        shopifyIntegrations={getEligibleShopifyIntegrationsFor(
                            RECHARGE_INTEGRATION_TYPE
                        )}
                        loading={commonProps.loading}
                    />
                )

            case SMILE_INTEGRATION_TYPE:
                if (isDetail) {
                    return (
                        <SmileIntegrationDetail
                            actions={actions}
                            integration={commonProps.integration}
                            loading={commonProps.loading}
                        />
                    )
                }

                return (
                    <SmileIntegrationList
                        actions={actions}
                        integrations={commonProps.integrations}
                        loading={commonProps.loading}
                        redirectUri={redirectUri}
                    />
                )

            case MAGENTO2_INTEGRATION_TYPE:
                if (isDetail) {
                    return (
                        <Magento2IntegrationDetail
                            actions={actions}
                            integration={commonProps.integration}
                            isUpdate={isUpdate}
                            loading={commonProps.loading}
                            redirectUri={redirectUri}
                        />
                    )
                }

                return (
                    <Magento2IntegrationList
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
    getEligibleShopifyIntegrationsFor: PropTypes.func.isRequired,
    params: PropTypes.shape({
        integrationType: PropTypes.string.isRequired,
        integrationId: PropTypes.string,
    }).isRequired,
    getRedirectUri: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
    integrations: state.integrations,
    getEligibleShopifyIntegrationsFor: IntegrationsSelectors.getEligibleShopifyIntegrationsFor(
        state
    ),
    getRedirectUri: IntegrationsSelectors.makeGetRedirectUri(state),
    currentUser: state.currentUser,
})

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(IntegrationsActions, dispatch),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(IntegrationDetailContainer)
