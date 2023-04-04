import React from 'react'
import {connect} from 'react-redux'
import {fromJS, List, Map} from 'immutable'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {
    getHasAutomationAddOn,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'
import {deleteIntegration} from 'state/integrations/actions'
import NavigatedSuccessModal, {
    NavigatedSuccessModalName,
} from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import {SuccessModalIcon} from 'pages/common/components/SuccessModal/SuccessModal'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {getChatInstallationStatus} from 'state/entities/chatInstallationStatus/selectors'
import {ChatInstallationStatusState} from 'state/entities/chatInstallationStatus'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../../../../../constants/integration'
import {notify} from '../../../../../../state/notifications/actions'
import * as integrationSelectors from '../../../../../../state/integrations/selectors'
import {RootState} from '../../../../../../state/types'
import {IntegrationType} from '../../../../../../models/integration/types'
import PageHeader from '../../../../../common/components/PageHeader'

import {renderChatCodeSnippet} from '../renderChatCodeSnippet'
import GorgiasChatIntegrationNavigation from '../GorgiasChatIntegrationNavigation'

import GorgiasChatIntegrationOneClickInstallationCard from './GorgiasChatIntegrationOneClickInstallationCard'
import GorgiasChatIntegrationCustomInstallationCard from './GorgiasChatIntegrationCustomInstallationCard'
import {GorgiasChatIntegrationConnectToStoreCard} from './GorgiasChatIntegrationConnectToStoreCard'
import NewGorgiasChatIntegrationInstall from './NewGorgiasChatIntegrationInstall'
import css from './GorgiasChatIntegrationInstall.less'

type OwnProps = {
    integration: Map<any, any>
    actions: {
        updateOrCreateIntegration: any
        deleteIntegration: typeof deleteIntegration
    }
    isUpdate: boolean
    installationStatus: ChatInstallationStatusState
}

const mapStateToProps = (state: RootState) => {
    return {
        domain: state.currentAccount.get('domain'),
        hasAutomationAddOn: getHasAutomationAddOn(state),
        hasLegacyAutomationAddOnFeatures:
            getHasLegacyAutomationAddOnFeatures(state),
        getIntegrationsByTypes:
            integrationSelectors.makeGetIntegrationsByTypes(state),
        gorgiasChatExtraState:
            integrationSelectors.getIntegrationTypeExtraState(
                GORGIAS_CHAT_INTEGRATION_TYPE as IntegrationType
            )(state),
        installationStatus: getChatInstallationStatus(state),
    }
}

const mapDispatchToProps = {
    notify,
}

function GorgiasChatIntegrationInstall({
    integration,
    getIntegrationsByTypes,
    actions,
    gorgiasChatExtraState,
    hasAutomationAddOn,
    hasLegacyAutomationAddOnFeatures,
    isUpdate,
    installationStatus,
}: OwnProps & ReturnType<typeof mapStateToProps>) {
    const isAutomationSettingsRevampEnabled =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]
    // During the chat creation, the user associated this chat to a shopify store.
    // This chat can only be installed on this specific store
    // Change to associated_shopify_store_id?
    const isAssociatedToShopifyStore = Boolean(
        integration.getIn(['meta', 'shop_name'])
    )

    const shopifyIntegrationsIds: List<number> = integration.getIn(
        ['meta', 'shopify_integration_ids'],
        fromJS([])
    )
    // Check if the chat has already shopify installations
    // even if shop_name and shop_type are not set
    const hasShopifyInstallation = shopifyIntegrationsIds.size > 0

    const shopifyIntegrations = getIntegrationsByTypes(
        SHOPIFY_INTEGRATION_TYPE as IntegrationType
    )

    const gorgiasChatIntegrations = getIntegrationsByTypes(
        GORGIAS_CHAT_INTEGRATION_TYPE as IntegrationType
    )

    const isShopifyChat = isAssociatedToShopifyStore || hasShopifyInstallation

    const hasOrderManagement =
        hasAutomationAddOn || hasLegacyAutomationAddOnFeatures

    const manualInstallationSuccessModal = (
        <NavigatedSuccessModal
            name={NavigatedSuccessModalName.GorgiasChatManualInstallation}
            icon={SuccessModalIcon.PinchingHand}
            buttonLabel="See instructions"
        >
            <div className="heading-page-semibold mb-2">Almost there!</div>
            <div className="heading-subsection-regular">
                Install the chat on your website by following the{' '}
                <b>Manual installation</b> instructions.
            </div>
        </NavigatedSuccessModal>
    )

    if (isAutomationSettingsRevampEnabled) {
        return (
            <>
                {manualInstallationSuccessModal}
                <NewGorgiasChatIntegrationInstall
                    integration={integration}
                    actions={actions}
                    isUpdate={isUpdate}
                />
            </>
        )
    }

    return (
        <>
            {manualInstallationSuccessModal}
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link
                                    to={`/app/settings/channels/${IntegrationType.GorgiasChat}`}
                                >
                                    Chat
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <GorgiasChatIntegrationNavigation integration={integration} />

                <Container fluid className={css.pageContainer}>
                    <Row>
                        <Col className={css.pageColumn} md="8">
                            {!installationStatus.installed && (
                                <div className={css.installationStatusIssue}>
                                    <Alert type={AlertType.Error} icon>
                                        Your chat widget was not seen installed
                                        on your website in the past 72 hours.
                                        Check its installation and your website
                                        to resolve.{' '}
                                        <a
                                            href="https://docs.gorgias.com/en-US/chat-getting-started-81789#installation-monitoring"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            More information
                                        </a>
                                    </Alert>
                                </div>
                            )}
                            {isShopifyChat ? (
                                <GorgiasChatIntegrationOneClickInstallationCard
                                    integration={integration}
                                    updateOrCreateIntegration={
                                        actions.updateOrCreateIntegration
                                    }
                                    shopifyIntegrations={shopifyIntegrations}
                                    hasOrderManagement={hasOrderManagement}
                                />
                            ) : (
                                <GorgiasChatIntegrationConnectToStoreCard
                                    integration={integration}
                                    updateOrCreateIntegration={
                                        actions.updateOrCreateIntegration
                                    }
                                    shopifyIntegrations={shopifyIntegrations}
                                    gorgiasChatIntegrations={
                                        gorgiasChatIntegrations
                                    }
                                    hasOrderManagement={hasOrderManagement}
                                />
                            )}

                            <GorgiasChatIntegrationCustomInstallationCard
                                isShopifyChat={isShopifyChat}
                                code={renderChatCodeSnippet({
                                    chatAppId: integration.getIn([
                                        'meta',
                                        'app_id',
                                    ]),
                                    gorgiasChatExtraState:
                                        gorgiasChatExtraState,
                                })}
                                integrationId={integration.get('id')}
                            />
                            <div className={css.installationOptions}>
                                {isUpdate && (
                                    <ConfirmButton
                                        className=""
                                        onConfirm={() =>
                                            actions.deleteIntegration(
                                                integration
                                            ) as unknown as Promise<any>
                                        }
                                        confirmationContent="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                                        intent="destructive"
                                    >
                                        <ButtonIconLabel icon="delete">
                                            Delete Chat
                                        </ButtonIconLabel>
                                    </ConfirmButton>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GorgiasChatIntegrationInstall)
