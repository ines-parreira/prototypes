import React, {FormEvent, useEffect, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {bindActionCreators} from 'redux'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Form,
    Row,
} from 'reactstrap'

import classNames from 'classnames'

import {RootState} from '../../../../state/types'
import {getIntegrationsByTypes} from '../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../models/integration/types'
import {getSelfServiceConfigurations} from '../../../../state/self_service/selectors'
import {GorgiasThunkDispatch} from '../../../../../../../../types/redux-thunk'
import * as SelfServiceActions from '../../../../state/self_service/actions'
import PageHeader from '../../../common/components/PageHeader'
import SelectField from '../../../common/forms/SelectField/SelectField.js'

import {
    CancellationsDropdownOptionsList,
    FilterKeyEnum,
    FilterOperatorEnum,
    SelfServiceConfigurationFilter,
} from '../../../../state/self_service/types'
import Loader from '../../../common/components/Loader/Loader'
import Tooltip from '../../../common/components/Tooltip'

import css from './CancellationPolicyView.less'
import {useConfigurationData} from './hooks'

export const CancellationsPolicyView = ({
    actions,
    shopifyIntegrations,
    selfServiceConfigurations,
    match: {
        params: {shopName, integrationType},
    },
}: RouteComponentProps<{
    shopName: string
    integrationType: string
}> &
    ConnectedProps<typeof connector>) => {
    const {isLoadingConfig, configuration} = useConfigurationData({
        selfServiceConfigurations,
        actions,
        shopifyIntegrations,
        matchParams: {shopName, integrationType},
    })

    const [
        configCancelOrderStatusEligibility,
        setConfigCancelOrderStatusEligibility,
    ] = useState('')

    const [
        eligibilityWindowOptionValue,
        setEligibilityWindowOptionValue,
    ] = useState('')
    useEffect(() => {
        const currentOrderStatusEligibilityFilter:
            | SelfServiceConfigurationFilter
            | undefined = configuration?.cancel_order_policy?.eligibilities?.find(
            (eligibilityFilter: SelfServiceConfigurationFilter) => {
                return (
                    eligibilityFilter.key === FilterKeyEnum.GORGIAS_ORDER_STATUS
                )
            }
        )

        setEligibilityWindowOptionValue(
            currentOrderStatusEligibilityFilter?.value || ''
        )

        setConfigCancelOrderStatusEligibility(
            currentOrderStatusEligibilityFilter?.value || ''
        )
    }, [configuration])

    const [loading, setLoading] = useState(true)
    useEffect(() => {
        setLoading(isLoadingConfig)
    }, [isLoadingConfig])

    const onCancel = () => {
        setEligibilityWindowOptionValue(configCancelOrderStatusEligibility)
    }

    const onSubmit = (event: FormEvent) => {
        event.preventDefault()
        if (configuration === undefined) {
            return
        }
        setLoading(true)

        const updatedOrderStatusEligibility = {
            key: FilterKeyEnum.GORGIAS_ORDER_STATUS,
            value: eligibilityWindowOptionValue || '',
            operator: FilterOperatorEnum.EQUALS,
        } as SelfServiceConfigurationFilter

        const orderStatusEligibilityIndex = configuration.cancel_order_policy?.eligibilities?.findIndex(
            (eligibility: SelfServiceConfigurationFilter) =>
                eligibility.key === FilterKeyEnum.GORGIAS_ORDER_STATUS
        )

        const updatedEligibilities = configuration.cancel_order_policy
            ?.eligibilities
            ? [...configuration.cancel_order_policy.eligibilities]
            : []

        if (
            orderStatusEligibilityIndex === undefined ||
            orderStatusEligibilityIndex === -1
        ) {
            updatedEligibilities.push(updatedOrderStatusEligibility)
        } else if (orderStatusEligibilityIndex >= 0) {
            updatedEligibilities[
                orderStatusEligibilityIndex
            ] = updatedOrderStatusEligibility
        }

        return Promise.resolve(
            actions.updateSelfServiceConfigurations({
                ...configuration,
                cancel_order_policy: {
                    ...configuration.cancel_order_policy,
                    eligibilities: updatedEligibilities,
                },
            })
        ).then(() => {
            setLoading(false)
        })
    }

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
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/self-service/${integrationType}/${shopName}/preferences`}
                            >
                                {shopName}
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Cancellations</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container fluid className="page-container">
                <Row>
                    <Col>
                        <div className="mb-3">
                            <h4 className={css.cancellationsPolicyTitle}>
                                Cancellations
                            </h4>
                            <p className={css.cancellationsPolicyDescription}>
                                Let customers request order cancellations
                                directly from the chat portal.
                            </p>
                            <br></br>
                            {loading || !configuration ? (
                                <Loader />
                            ) : (
                                <>
                                    <h5 className={css.eligibilityWindowTitle}>
                                        Eligibility window
                                    </h5>
                                    <p
                                        className={
                                            css.eligibilityWindowDescription
                                        }
                                    >
                                        Order status after which customers will
                                        not be able to cancel an order anymore.
                                    </p>
                                    <Form onSubmit={onSubmit}>
                                        <div
                                            className={
                                                css.eligibilityWindowContainer
                                            }
                                        >
                                            <div
                                                id="order-status"
                                                className={css.orderStatus}
                                            >
                                                Order status is:
                                            </div>
                                            <Tooltip
                                                autohide={false}
                                                delay={100}
                                                target="order-status"
                                                placement="top"
                                            >
                                                Passed the selected order
                                                status, customers will not be
                                                allowed to cancel an order. For
                                                instance, if the status
                                                `Fulfillment in process` is
                                                selected, customers will only be
                                                able to cancel orders that are
                                                unfulfilled or in process of
                                                fulfillment.
                                            </Tooltip>
                                            <SelectField
                                                placeholder="Select Status"
                                                className={
                                                    css.orderStatusSelectField
                                                }
                                                value={
                                                    eligibilityWindowOptionValue
                                                }
                                                options={
                                                    CancellationsDropdownOptionsList
                                                }
                                                onChange={
                                                    setEligibilityWindowOptionValue
                                                }
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            color="success"
                                            className={classNames('mr-2', {
                                                'btn-loading': loading,
                                            })}
                                            disabled={
                                                loading ||
                                                eligibilityWindowOptionValue ===
                                                    configCancelOrderStatusEligibility
                                            }
                                        >
                                            Save changes
                                        </Button>
                                        <Button
                                            type="button"
                                            className={classNames({
                                                'btn-loading': loading,
                                            })}
                                            disabled={
                                                loading ||
                                                eligibilityWindowOptionValue ===
                                                    configCancelOrderStatusEligibility
                                            }
                                            onClick={onCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </Form>
                                    <br />
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

export default withRouter(connector(CancellationsPolicyView))
