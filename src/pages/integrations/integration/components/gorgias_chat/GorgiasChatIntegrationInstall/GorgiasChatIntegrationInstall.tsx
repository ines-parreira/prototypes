import React from 'react'
import {connect} from 'react-redux'
import {List, Map, fromJS} from 'immutable'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'
import classnames from 'classnames'

import {getHasAutomationAddOn} from 'state/billing/selectors'
import {
    deleteIntegration,
    activateIntegration,
    deactivateIntegration,
} from 'state/integrations/actions'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ToggleInput from 'pages/common/forms/ToggleInput'
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
import css from './GorgiasChatIntegrationInstall.less'

type OwnProps = {
    integration: Map<any, any>
    actions: {
        updateOrCreateIntegration: any
        deleteIntegration: typeof deleteIntegration
        activateIntegration: typeof activateIntegration
        deactivateIntegration: typeof deactivateIntegration
    }
    isUpdate: boolean
    loading: Map<any, any>
}

const mapStateToProps = (state: RootState) => {
    return {
        domain: state.currentAccount.get('domain'),
        hasAutomationAddOn: getHasAutomationAddOn(state),
        getIntegrationsByTypes:
            integrationSelectors.makeGetIntegrationsByTypes(state),
        gorgiasChatExtraState:
            integrationSelectors.getIntegrationTypeExtraState(
                GORGIAS_CHAT_INTEGRATION_TYPE as IntegrationType
            )(state),
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
    isUpdate,
    loading,
}: OwnProps & ReturnType<typeof mapStateToProps>) {
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

    const isDisabled = integration.get('deactivated_datetime')

    const toggleActivationState = () => {
        const integrationId = integration.get('id') as number
        if (isDisabled) {
            actions.activateIntegration(integrationId)
        } else {
            actions.deactivateIntegration(integrationId)
        }
    }

    const isLoading = loading.get('updateIntegration') === integration.get('id')

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">
                                Integrations
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/integrations/${GORGIAS_CHAT_INTEGRATION_TYPE}`}
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
                        {isShopifyChat ? (
                            <GorgiasChatIntegrationOneClickInstallationCard
                                integration={integration}
                                updateOrCreateIntegration={
                                    actions.updateOrCreateIntegration
                                }
                                shopifyIntegrations={shopifyIntegrations}
                                hasAutomationAddOn={hasAutomationAddOn}
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
                            />
                        )}

                        <GorgiasChatIntegrationCustomInstallationCard
                            isShopifyChat={isShopifyChat}
                            code={renderChatCodeSnippet({
                                chatAppId: integration.getIn([
                                    'meta',
                                    'app_id',
                                ]),
                                gorgiasChatExtraState: gorgiasChatExtraState,
                            })}
                            integrationId={integration.get('id')}
                        />
                        <div className={css.installationOptions}>
                            <div
                                className={classnames(css.formGroup, 'd-flex')}
                            >
                                <ToggleInput
                                    onClick={() => toggleActivationState()}
                                    isToggled={isDisabled}
                                    isLoading={isLoading}
                                    isDisabled={isLoading}
                                    aria-label="Hide chat temporarily"
                                />
                                <div className="ml-2">
                                    <b>Hide chat temporarily</b>
                                </div>
                            </div>
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
                                        Delete chat
                                    </ButtonIconLabel>
                                </ConfirmButton>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GorgiasChatIntegrationInstall)
