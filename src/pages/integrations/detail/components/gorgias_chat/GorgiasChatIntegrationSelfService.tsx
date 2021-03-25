import React, {useEffect} from 'react'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {Map} from 'immutable'

import {
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Row,
    Table,
    Alert,
} from 'reactstrap'

import {bindActionCreators} from 'redux'

import PageHeader from '../../../../common/components/PageHeader'
import {getIconFromUrl} from '../../../../../state/integrations/helpers'

import {RootState} from '../../../../../state/types'
import {getIntegrationsByTypes} from '../../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../../models/integration/types'

import {
    getLoading,
    getSelfServiceConfigurations,
} from '../../../../../state/self_service/selectors'
import {MigratedIntegrationRow} from '../../../../settings/selfService/components/MigratedIntegrationRow'

import {GorgiasThunkDispatch} from '../../../../../../../../../types/redux-thunk'
import * as SelfServiceActions from '../../../../../state/self_service/actions'

import {SelfServiceConfiguration} from '../../../../../state/self_service/types'

import ChatIntegrationNavigation from './GorgiasChatIntegrationNavigation.js'

type OwnProps = {
    integration: Map<any, any>
    shopifyIntegrations: Immutable.List<any>
}

const selfServiceMock = getIconFromUrl('integrations/self_service.png')

const _findConfiguration = (
    selfServiceConfigurations: SelfServiceConfiguration[],
    shopifyIntegration: Map<any, any>
): SelfServiceConfiguration | undefined => {
    return selfServiceConfigurations.find((configuration) => {
        return (
            configuration.shop_name ===
            shopifyIntegration.getIn(['meta', 'shop_name'])
        )
    })
}

export function GorgiasChatIntegrationSelfServiceComponent({
    actions,
    isLoadingConfigurations,
    selfServiceConfigurations,
    integration,
    shopifyIntegrations,
}: OwnProps & ConnectedProps<typeof connector>) {
    useEffect(() => {
        actions.fetchSelfServiceConfigurations()
    }, [])

    const shopNames = shopifyIntegrations
        .map(
            (integration: Map<any, any>) =>
                integration.getIn(['meta', 'shop_name']) as string
        )
        .toArray()

    const integrationType: string = integration.get('type')

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
                                to={`/app/settings/integrations/${integrationType}`}
                            >
                                Chat
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.get('name')}
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Self-service</BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <ChatIntegrationNavigation integration={integration} />

            <Container fluid className="page-container">
                <Row>
                    <Col>
                        <div className="mb-4">
                            <h4>Self-service</h4>
                            <p>
                                Most e-commerce support requests are about the
                                same 20 types of issues.
                                <br />
                                <br />
                                Self-service enables your customers to browse
                                their orders and select the type of issue they
                                are having. It will create a chat ticket for
                                your team to handle.
                            </p>
                        </div>

                        {shopNames.length === 0 ? (
                            <Alert color="warning">
                                No active Shopify store detected. Please make
                                sure to add a Shopify integration to access the
                                Self-service features.
                            </Alert>
                        ) : (
                            <>
                                <h5>Enable Self-service</h5>
                                <p>
                                    Self-service is only available for Shopify
                                    stores with an active chat integration. If
                                    you installed the chat widget manually,
                                    please refer to{' '}
                                    <a href="https://docs.gorgias.com/article/48muw8we2j-installing-and-using-the-self-service-chat-portal">
                                        this documentation
                                    </a>{' '}
                                    for the extra steps required to enable the
                                    Self-service feature.
                                </p>
                                <Table
                                    className="table-integrations mt-3"
                                    hover
                                >
                                    <tbody>
                                        {shopifyIntegrations
                                            .valueSeq()
                                            .map(
                                                (
                                                    integration: Map<any, any>
                                                ) => (
                                                    <MigratedIntegrationRow
                                                        key={integration.get(
                                                            'id'
                                                        )}
                                                        integration={
                                                            integration
                                                        }
                                                        configuration={_findConfiguration(
                                                            selfServiceConfigurations,
                                                            integration
                                                        )}
                                                        isLoadingConfigurations={
                                                            isLoadingConfigurations
                                                        }
                                                        actions={actions}
                                                    />
                                                )
                                            )}
                                    </tbody>
                                </Table>
                            </>
                        )}
                    </Col>

                    <Col>
                        <img
                            src={selfServiceMock}
                            width="442"
                            height="689"
                            alt="Self-service Mock"
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

const mapStateToProps = (state: RootState) => {
    return {
        shopifyIntegrations: getIntegrationsByTypes(
            IntegrationType.ShopifyIntegrationType
        )(state),
        selfServiceConfigurations: getSelfServiceConfigurations(state),
        isLoadingConfigurations: getLoading(state),
    }
}

const connector = connect(
    mapStateToProps,
    (dispatch: GorgiasThunkDispatch<any, any, any>) => {
        return {
            actions: bindActionCreators(SelfServiceActions, dispatch),
        }
    }
)

export default connector(GorgiasChatIntegrationSelfServiceComponent)
