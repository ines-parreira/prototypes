import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react'
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
    Input,
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
    FilterKeyEnum,
    FilterOperatorEnum,
    ReturnsDropdownOptionsList,
    SelfServiceConfigurationFilter,
} from '../../../../state/self_service/types'
import Loader from '../../../common/components/Loader/Loader'

import css from './ReturnsPolicyView.less'
import {useConfigurationData} from './hooks'

export const ReturnsPolicyView = ({
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
        eligibilityWindowCondition,
        setEligibilityWindowCondition,
    ] = useState('')

    const [
        eligibilityWindowConditionValue,
        setEligibilityWindowConditionValue,
    ] = useState('1')
    const [storedEligibility, setStoredEligibility] = useState({
        value: '1',
        condition: '',
    })

    const [showLessThan, setShowLessThan] = useState(false)
    useEffect(() => {
        const eligibilityFilter:
            | SelfServiceConfigurationFilter
            | undefined = configuration?.return_order_policy?.eligibilities?.find(
            (_eligibilityFilter: SelfServiceConfigurationFilter) =>
                [
                    FilterKeyEnum.ORDER_CREATED_AT,
                    FilterKeyEnum.ORDER_DELIVERED_AT,
                ].includes(_eligibilityFilter.key as FilterKeyEnum)
        )

        setEligibilityWindowCondition(eligibilityFilter?.key || '')
        setShowLessThan(Boolean(eligibilityFilter?.key))
        setEligibilityWindowConditionValue(eligibilityFilter?.value || '1')

        setStoredEligibility({
            value: eligibilityFilter?.value || '1',
            condition: eligibilityFilter?.key || '',
        })
    }, [configuration])

    const [loading, setLoading] = useState(true)
    useEffect(() => {
        setLoading(isLoadingConfig)
    }, [isLoadingConfig])

    const onCancel = () => {
        setEligibilityWindowConditionValue(storedEligibility.value)
        setEligibilityWindowCondition(storedEligibility.condition)
    }

    const onSubmit = (event: FormEvent) => {
        event.preventDefault()
        if (configuration === undefined) {
            return
        }
        setLoading(true)

        const updatedEligibilityWindowCondition = {
            key: eligibilityWindowCondition,
            value: eligibilityWindowConditionValue || '',
            operator: FilterOperatorEnum.LESS_THAN,
        } as SelfServiceConfigurationFilter

        const orderStatusEligibilityIndex = configuration.return_order_policy?.eligibilities?.findIndex(
            (eligibility: SelfServiceConfigurationFilter) =>
                [
                    FilterKeyEnum.ORDER_CREATED_AT,
                    FilterKeyEnum.ORDER_DELIVERED_AT,
                ].includes(eligibility.key as FilterKeyEnum)
        )

        const updatedEligibilities = configuration.return_order_policy
            ?.eligibilities
            ? [...configuration.return_order_policy.eligibilities]
            : []

        if (
            orderStatusEligibilityIndex === undefined ||
            orderStatusEligibilityIndex === -1
        ) {
            updatedEligibilities.push(updatedEligibilityWindowCondition)
        } else if (orderStatusEligibilityIndex >= 0) {
            updatedEligibilities[
                orderStatusEligibilityIndex
            ] = updatedEligibilityWindowCondition
        }

        return Promise.resolve(
            actions.updateSelfServiceConfigurations({
                ...configuration,
                return_order_policy: {
                    ...configuration.return_order_policy,
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
                        <BreadcrumbItem active>Returns</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container fluid className="page-container">
                <Row>
                    <Col>
                        <div className="mb-3">
                            <h4 className={css.returnsPolicyTitle}>Returns</h4>
                            <p>
                                Let customers request returns directly from the
                                chat portal. Returns can only be initiated if
                                the order has been delivered.
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
                                        Timeframe through which customers will
                                        be able to initiate a return.
                                    </p>
                                    <Form onSubmit={onSubmit}>
                                        <div
                                            className={
                                                css.eligibilityWindowContainer
                                            }
                                        >
                                            <SelectField
                                                placeholder="Select Condition"
                                                className={
                                                    css.returnConditionSelectField
                                                }
                                                value={
                                                    eligibilityWindowCondition
                                                }
                                                options={
                                                    ReturnsDropdownOptionsList
                                                }
                                                onChange={(
                                                    condition: string
                                                ) => {
                                                    setEligibilityWindowCondition(
                                                        condition
                                                    )
                                                    setShowLessThan(true)
                                                }}
                                            />
                                            {showLessThan ? (
                                                <>
                                                    <div
                                                        style={{
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        less than
                                                    </div>
                                                    <Input
                                                        className={
                                                            css.returnConditionInput
                                                        }
                                                        type="number"
                                                        min={1}
                                                        value={
                                                            eligibilityWindowConditionValue
                                                        }
                                                        onChange={(
                                                            event: ChangeEvent<
                                                                HTMLInputElement
                                                            >
                                                        ) => {
                                                            setEligibilityWindowConditionValue(
                                                                event.target
                                                                    .value
                                                            )
                                                        }}
                                                    />
                                                    <div
                                                        style={{
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        day(s) ago
                                                    </div>
                                                </>
                                            ) : null}
                                        </div>
                                        <Button
                                            type="submit"
                                            color="success"
                                            className={classNames('mr-2', {
                                                'btn-loading': loading,
                                            })}
                                            disabled={loading}
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
                                                (eligibilityWindowConditionValue ===
                                                    storedEligibility.value &&
                                                    eligibilityWindowCondition ===
                                                        storedEligibility.condition)
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

export default withRouter(connector(ReturnsPolicyView))
