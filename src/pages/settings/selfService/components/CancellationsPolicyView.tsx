import React, {FormEvent, useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Col, Container, Form, Row} from 'reactstrap'
import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'

import PageHeader from 'pages/common/components/PageHeader'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import Loader from 'pages/common/components/Loader/Loader'
import Tooltip from 'pages/common/components/Tooltip'
import {getCancellationOptionFromEligibilityStatuses} from 'pages/settings/selfService/utils/getCancellationOptionFromEligibilityStatuses'
import {
    CancellationsDropdownOptionsList,
    CancellationsOptionToEligibilityStatuses,
} from 'pages/settings/selfService/types'
import {
    FilterKeyEnum,
    FilterOperatorEnum,
    SelfServiceConfigurationFilter,
    SelfServiceOrderStatusEnum,
} from 'models/selfServiceConfiguration/types'
import {updateSelfServiceConfiguration} from 'models/selfServiceConfiguration/resources'
import {selfServiceConfigurationUpdated} from 'state/entities/selfServiceConfigurations/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {hasAutomationLegacyFeatures} from 'state/currentAccount/selectors'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {GorgiasChatIntegrationSelfServicePaywall} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import settingsCss from 'pages/settings/settings.less'

import {useConfigurationData} from './hooks'
import css from './CancellationPolicyView.less'

export const CancellationsPolicyView = () => {
    const dispatch = useAppDispatch()
    const {shopName, integrationType} = useParams<{
        shopName: string
        integrationType: string
    }>()

    const {isLoadingConfig, configuration} = useConfigurationData()

    const hasSelfServiceV1Features = useAppSelector(hasAutomationLegacyFeatures)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const [showDeleteButton, setShowDeleteButton] = useState(true)

    const [
        configCancelOrderStatusEligibility,
        setConfigCancelOrderStatusEligibility,
    ] = useState('')

    const [eligibilityWindowOptionValue, setEligibilityWindowOptionValue] =
        useState('')
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
        const eligibilityFilterValue =
            currentOrderStatusEligibilityFilter?.value || []
        const optionToSet = getCancellationOptionFromEligibilityStatuses(
            eligibilityFilterValue as SelfServiceOrderStatusEnum[]
        )
        const showDeleteStateToSet = Boolean(optionToSet)

        setEligibilityWindowOptionValue(optionToSet)
        setConfigCancelOrderStatusEligibility(optionToSet)
        setShowDeleteButton(showDeleteStateToSet)
    }, [configuration, configuration?.cancel_order_policy.eligibilities])

    const [loading, setLoading] = useState(true)
    useEffect(() => {
        setLoading(isLoadingConfig)
    }, [isLoadingConfig])

    const onCancel = () => {
        setEligibilityWindowOptionValue(configCancelOrderStatusEligibility)
    }

    const onDelete = () => {
        setEligibilityWindowOptionValue('')
        setShowDeleteButton(false)
    }

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        if (configuration === undefined) {
            return
        }
        setLoading(true)

        const updatedOrderStatusEligibility = {
            key: FilterKeyEnum.GORGIAS_ORDER_STATUS,
            value: CancellationsOptionToEligibilityStatuses[
                eligibilityWindowOptionValue
            ],
            operator: FilterOperatorEnum.ONE_OF,
        } as SelfServiceConfigurationFilter

        const updatedEligibilities: SelfServiceConfigurationFilter[] = []
        let hasUpdatedEligibility = false

        configuration.cancel_order_policy.eligibilities?.forEach(
            (eligibility) => {
                if (eligibility.key === FilterKeyEnum.GORGIAS_ORDER_STATUS) {
                    if (eligibilityWindowOptionValue) {
                        updatedEligibilities.push(updatedOrderStatusEligibility)
                        hasUpdatedEligibility = true
                    }
                } else {
                    updatedEligibilities.push(eligibility)
                }
            }
        )
        // the GORGIAS_ORDER_STATUS was not present in eligibilities
        if (!hasUpdatedEligibility && eligibilityWindowOptionValue) {
            updatedEligibilities.push(updatedOrderStatusEligibility)
        }

        try {
            const res = await updateSelfServiceConfiguration({
                ...configuration,
                cancel_order_policy: {
                    ...configuration.cancel_order_policy,
                    eligibilities: updatedEligibilities,
                },
            })
            void dispatch(selfServiceConfigurationUpdated(res))
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Policy successfully updated.',
                })
            )
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Could not update policy, please try again later.',
                })
            )
        } finally {
            setLoading(false)
        }
    }

    if (!(hasSelfServiceV1Features || hasAutomationAddOn)) {
        return <GorgiasChatIntegrationSelfServicePaywall />
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
                                to={`/app/settings/self-service/${integrationType}/${shopName}/preferences/order-management`}
                            >
                                {shopName}
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Cancel</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container fluid className={settingsCss.pageContainer}>
                <Row>
                    <Col>
                        <div className="mb-3">
                            <h4 className={css.cancellationsPolicyTitle}>
                                Cancel
                            </h4>
                            <p className={css.cancellationsPolicyDescription}>
                                Let customers request order cancellations
                                directly from the Self-service Portal in Chat
                                and Help Center.
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
                                        Customers will be able to cancel an
                                        order up to the following status:
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
                                                Order status is
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
                                                onChange={(value) =>
                                                    setEligibilityWindowOptionValue(
                                                        value as string
                                                    )
                                                }
                                            />
                                            {showDeleteButton &&
                                            eligibilityWindowOptionValue ? (
                                                <div
                                                    onClick={onDelete}
                                                    className={css.deleteButton}
                                                >
                                                    <i className="material-icons red mr-1">
                                                        clear
                                                    </i>
                                                </div>
                                            ) : null}
                                        </div>
                                        <Button
                                            className={classNames('mr-2', {
                                                'btn-loading': loading,
                                            })}
                                            isDisabled={
                                                loading ||
                                                eligibilityWindowOptionValue ===
                                                    configCancelOrderStatusEligibility
                                            }
                                            type="submit"
                                        >
                                            Save changes
                                        </Button>
                                        <Button
                                            className={classNames({
                                                'btn-loading': loading,
                                            })}
                                            isDisabled={
                                                loading ||
                                                eligibilityWindowOptionValue ===
                                                    configCancelOrderStatusEligibility
                                            }
                                            intent="secondary"
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

export default CancellationsPolicyView
