import React, {useEffect} from 'react'
import {Alert, Col, Container, Row, Table} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import {bindActionCreators} from 'redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {Map} from 'immutable'

import PageHeader from '../../../common/components/PageHeader'
import Tooltip from '../../../common/components/Tooltip'
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
import css from './SelfServiceView.less'

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
    actions,
    isLoadingConfigurations,
}: Props) => {
    useEffect(() => {
        actions.fetchSelfServiceConfigurations()
    }, [])

    return (
        <div className="full-width">
            <PageHeader title="Self-service" />

            <Container fluid className="page-container">
                <Row>
                    <Col className={css.contentColumn}>
                        <div className="mb-3">
                            <p>
                                Most ecommerce support requests are about the
                                same 20 types of issues.
                            </p>
                            <p>
                                Self-service enables your customers to browse
                                their orders and select the type of issue they
                                are having. It will then create a chat ticket
                                for your team to handle.
                            </p>
                            <h5 className={css.enableSelfServiceTitle}>
                                Enable Self-service{' '}
                                <i
                                    id="enable-self-service-icon"
                                    className={`material-icons-outlined ${css.enableSelfServiceIcon}`}
                                >
                                    info
                                </i>
                                <Tooltip
                                    target="enable-self-service-icon"
                                    placement="top"
                                    popperClassName={
                                        css.enableSelfServiceTooltip
                                    }
                                >
                                    Self-Service is currently only available for
                                    chat.
                                </Tooltip>
                            </h5>
                            {shopifyIntegrations.size === 0 ? (
                                <Alert color="warning">
                                    No active Shopify store detected. Please
                                    make sure to add a Shopify integration to
                                    access the Self-service features.
                                </Alert>
                            ) : (
                                <>
                                    <p>
                                        Self-service is only available to stores
                                        that have a Shopify store integration.
                                    </p>
                                    <Table
                                        className={`table-hover table-integrations ${css.selfServiceIntegrationsTable}`}
                                    >
                                        <tbody>
                                            {!isLoadingConfigurations &&
                                                shopifyIntegrations
                                                    .valueSeq()
                                                    .map(
                                                        (
                                                            integration: Map<
                                                                any,
                                                                any
                                                            >
                                                        ) => (
                                                            <IntegrationRow
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
                                                                actions={
                                                                    actions
                                                                }
                                                            />
                                                        )
                                                    )}
                                        </tbody>
                                    </Table>
                                </>
                            )}
                        </div>
                    </Col>
                    <Col>
                        <img
                            src={selfServiceMock}
                            width="442"
                            height="689"
                            alt="Self-service example"
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
