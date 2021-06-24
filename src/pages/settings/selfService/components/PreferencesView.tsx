import React from 'react'
import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Row,
    Table,
} from 'reactstrap'
import {withRouter, Link, RouteComponentProps} from 'react-router-dom'
import {bindActionCreators} from 'redux'

import {connect, ConnectedProps} from 'react-redux'

import Tooltip from '../../../common/components/Tooltip'
import PageHeader from '../../../common/components/PageHeader'
import {RootState} from '../../../../state/types'
import {getIntegrationsByTypes} from '../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../models/integration/types'
import {GorgiasThunkDispatch} from '../../../../../../../../types/redux-thunk'
import * as SelfServiceActions from '../../../../state/self_service/actions'
import {PolicyEnum} from '../../../../state/self_service/types'
import {
    getLoading,
    getSelfServiceConfigurations,
} from '../../../../state/self_service/selectors'

import Loader from '../../../common/components/Loader/Loader'

import {PolicyRow} from './PolicyRow'
import {useConfigurationData} from './hooks'
import css from './PreferencesView.less'

export const PreferencesView = ({
    shopifyIntegrations,
    selfServiceConfigurations,
    actions,
    match: {
        params: {shopName, integrationType},
    },
}: RouteComponentProps<{shopName: string; integrationType: string}> &
    ConnectedProps<typeof connector>) => {
    const {
        isLoadingConfig: loading,
        integration,
        configuration,
    } = useConfigurationData({
        selfServiceConfigurations,
        actions,
        shopifyIntegrations,
        matchParams: {shopName, integrationType},
    })

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/self-service">
                                Self-service
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {integration.getIn(['meta', 'shop_name'])}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <Container fluid className="page-container">
                <Row>
                    <Col>
                        <div className="mb-3">
                            <h4 className={css.preferencesTitle}>
                                Preferences
                            </h4>
                            <p
                                id="email-capture-help"
                                className={css.preferencesDescription}
                            >
                                Choose preferences of the actions your customers
                                will be able to take with the Self-service
                                portal. Note that actions available for each
                                <span id="orders-shipments">
                                    <b> order’s shipments</b>
                                </span>{' '}
                                <Tooltip
                                    autohide={false}
                                    delay={100}
                                    placement="top"
                                    target="orders-shipments"
                                >
                                    Gorgias breaks down orders into shipments
                                    (one or more) allowing shoppers to track or
                                    take actions related to individual
                                    shipments.
                                </Tooltip>
                                depend on their statuses.{' '}
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://docs.gorgias.com/self-service/self-service-portal-statuses"
                                >
                                    Read more
                                </a>{' '}
                                about all existing order shipment statuses &
                                corresponding available actions.
                            </p>
                            {loading ? (
                                <Loader />
                            ) : !configuration ? (
                                <Alert color="warning">
                                    Could not find the configuration for this
                                    store. Please try again later.
                                </Alert>
                            ) : (
                                <>
                                    {configuration.deactivated_datetime ? (
                                        <Alert color="warning">
                                            Self-service is inactive for this
                                            store. Go to the main Self-service
                                            page to activate it.
                                        </Alert>
                                    ) : null}
                                    <Table>
                                        <tbody>
                                            <PolicyRow
                                                integration={integration}
                                                policyKey={
                                                    PolicyEnum.TRACK_ORDER_POLICY
                                                }
                                                policyName="Track order"
                                                policyDescription="Let customers track
                                                        orders directly from the
                                                        chat portal"
                                                configuration={configuration}
                                                actions={actions}
                                            />
                                            <PolicyRow
                                                policyKey={
                                                    PolicyEnum.REPORT_ISSUE_POLICY
                                                }
                                                integration={integration}
                                                policyName="Report issue"
                                                policyDescription="Let customers report an
                                                        issue with an order"
                                                configuration={configuration}
                                                actions={actions}
                                            />
                                            <PolicyRow
                                                policyKey={
                                                    PolicyEnum.RETURN_ORDER_POLICY
                                                }
                                                integration={integration}
                                                policyName="Returns"
                                                policyDescription="Let customers request returns directly
                                                        from the chat portal"
                                                configuration={configuration}
                                                actions={actions}
                                            />
                                            <PolicyRow
                                                policyKey={
                                                    PolicyEnum.CANCEL_ORDER_POLICY
                                                }
                                                integration={integration}
                                                policyName="Cancellations"
                                                policyDescription="Let customers request order cancellations
                                                        directly from the chat portal"
                                                configuration={configuration}
                                                actions={actions}
                                            />
                                        </tbody>
                                    </Table>
                                </>
                            )}
                        </div>
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

export default withRouter(connector(PreferencesView))
