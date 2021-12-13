import React from 'react'
import {connect} from 'react-redux'
import {List, Map, fromJS} from 'immutable'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'

import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../../../../../constants/integration'
import {notify} from '../../../../../../state/notifications/actions'
import * as integrationSelectors from '../../../../../../state/integrations/selectors'
import {RootState} from '../../../../../../state/types'
import {IntegrationType} from '../../../../../../models/integration/types'
import PageHeader from '../../../../../common/components/PageHeader'

import css from '../../../../../settings/settings.less'

import {renderChatCodeSnippet} from '../renderChatCodeSnippet.js'
import GorgiasChatIntegrationNavigation from '../GorgiasChatIntegrationNavigation'

import GorgiasChatIntegrationOneClickInstallationCard from './GorgiasChatIntegrationOneClickInstallationCard'
import GorgiasChatIntegrationCustomInstallationCard from './GorgiasChatIntegrationCustomInstallationCard'

type OwnProps = {
    integration: Map<any, any>
    actions: {
        updateOrCreateIntegration: any
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        domain: state.currentAccount.get('domain'),
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

    const isShopifyChat = isAssociatedToShopifyStore || hasShopifyInstallation

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
                    <Col md="8">
                        {isShopifyChat && (
                            <GorgiasChatIntegrationOneClickInstallationCard
                                integration={integration}
                                updateOrCreateIntegration={
                                    actions.updateOrCreateIntegration
                                }
                                shopifyIntegrations={shopifyIntegrations}
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
