import React, {useEffect} from 'react'
import {Col, Container, Row, Table} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import {bindActionCreators} from 'redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {Map} from 'immutable'

import PageHeader from '../../../common/components/PageHeader'
import {RootState} from '../../../../state/types'

import {getIntegrationsByTypes} from '../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../models/integration/types'

import {getIconFromUrl} from '../../../../state/integrations/helpers'

import * as SelfServiceActions from '../../../../state/self_service/actions'

import {GorgiasThunkDispatch} from '../../../../../../../../types/redux-thunk'

import {
    getLoading,
    getSelfServiceConfigurations,
} from '../../../../state/self_service/selectors'

import {SelfServiceConfiguration} from '../../../../state/self_service/types'

import {IntegrationRow} from './IntegrationRow'

type Props = RouteComponentProps & ConnectedProps<typeof connector>

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

export const SelfServiceView = ({
    shopifyIntegrations,
    selfServiceConfigurations,
    isLoadingConfigurations,
    actions,
}: Props) => {
    useEffect(() => {
        actions.fetchSelfServiceConfigurations()
    }, [])

    return (
        <div className="full-width">
            <PageHeader title="Self-Service" />

            <Container fluid className="page-container">
                <Row>
                    <Col>
                        <div className="mb-3">
                            <p>
                                Most ecommerce support requests are about the
                                same 20 types of issues.
                            </p>
                            <p>
                                Self-Service enables your customers to browse
                                their orders and select the type of issue they
                                are having. It will then create a chat ticket
                                for your team to handle.
                            </p>
                            <h5>Enable Self-Service</h5>
                            <p>
                                Self-Service is only available to stores that
                                have a Shopify store integration.
                            </p>
                            <Table>
                                <tbody>
                                    {shopifyIntegrations
                                        .valueSeq()
                                        .map((integration: Map<any, any>) => (
                                            <IntegrationRow
                                                key={integration.get('id')}
                                                integration={integration}
                                                configuration={_findConfiguration(
                                                    selfServiceConfigurations,
                                                    integration
                                                )}
                                                isLoadingConfigurations={
                                                    isLoadingConfigurations
                                                }
                                                actions={actions}
                                            />
                                        ))}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                    <Col>
                        <img
                            src={selfServiceMock}
                            width="442"
                            height="689"
                            alt="Self-Service example"
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

const connector = connect(
    (state: RootState) => {
        return {
            shopifyIntegrations: getIntegrationsByTypes(
                IntegrationType.ShopifyIntegrationType
            )(state),
            selfServiceConfigurations: getSelfServiceConfigurations(state),
            isLoadingConfigurations: getLoading(state),
        }
    },
    (dispatch: GorgiasThunkDispatch<any, any, any>) => {
        return {
            actions: bindActionCreators(SelfServiceActions, dispatch),
        }
    }
)

export default withRouter(connector(SelfServiceView))
