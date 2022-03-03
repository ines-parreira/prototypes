import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Form,
    Input,
    Row,
} from 'reactstrap'
import classNames from 'classnames'
import {useSelector} from 'react-redux'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import PageHeader from '../../../common/components/PageHeader'
import SelectField from '../../../common/forms/SelectField/SelectField'
import Loader from '../../../common/components/Loader/Loader'
import {
    FilterKeyEnum,
    FilterOperatorEnum,
    ReturnsDropdownOptionsList,
    SelfServiceConfigurationFilter,
} from '../../../../models/selfServiceConfiguration/types'
import {selfServiceConfigurationUpdated} from '../../../../state/entities/selfServiceConfigurations/actions'
import {updateSelfServiceConfiguration} from '../../../../models/selfServiceConfiguration/resources'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {GorgiasChatIntegrationSelfServicePaywall} from '../../../integrations/detail/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import {hasAutomationLegacyFeatures} from '../../../../state/currentAccount/selectors'
import {getHasAutomationAddOn} from '../../../../state/billing/selectors'
import settingsCss from '../../settings.less'

import css from './ReturnsPolicyView.less'
import {useConfigurationData} from './hooks'

export const ReturnsPolicyView = () => {
    const dispatch = useAppDispatch()
    const {shopName, integrationType} = useParams<{
        shopName: string
        integrationType: string
    }>()

    const {isLoadingConfig, configuration} = useConfigurationData()

    const hasSelfServiceV1Features = useSelector(hasAutomationLegacyFeatures)
    const hasAutomationAddOn = useSelector(getHasAutomationAddOn)

    const [eligibilityWindowCondition, setEligibilityWindowCondition] =
        useState('')

    const [
        eligibilityWindowConditionValue,
        setEligibilityWindowConditionValue,
    ] = useState('1')
    const [storedEligibility, setStoredEligibility] = useState({
        value: '1',
        condition: '',
    })

    const [showDeleteButton, setShowDeleteButton] = useState(true)
    const [showLessThan, setShowLessThan] = useState(false)
    useEffect(() => {
        const eligibilityFilter: SelfServiceConfigurationFilter | undefined =
            configuration?.return_order_policy?.eligibilities?.find(
                (_eligibilityFilter: SelfServiceConfigurationFilter) =>
                    [
                        FilterKeyEnum.ORDER_CREATED_AT,
                        FilterKeyEnum.ORDER_DELIVERED_AT,
                    ].includes(_eligibilityFilter.key as FilterKeyEnum)
            )

        setEligibilityWindowCondition(eligibilityFilter?.key || '')
        setEligibilityWindowConditionValue(
            (eligibilityFilter?.value as string) || '1'
        )
        setStoredEligibility({
            value: (eligibilityFilter?.value as string) || '1',
            condition: eligibilityFilter?.key || '',
        })
        setShowDeleteButton(Boolean(eligibilityFilter?.key || ''))
    }, [configuration, configuration?.return_order_policy.eligibilities])

    useEffect(() => {
        setShowLessThan(
            Boolean(
                eligibilityWindowCondition !== '' && eligibilityWindowCondition
            )
        )
    }, [eligibilityWindowCondition])

    useEffect(() => {
        setLoading(isLoadingConfig)
    }, [isLoadingConfig])

    const [loading, setLoading] = useState(true)

    const formHasChanged =
        storedEligibility.value !== eligibilityWindowConditionValue ||
        storedEligibility.condition !== eligibilityWindowCondition

    const onCancel = () => {
        setEligibilityWindowConditionValue(storedEligibility.value)
        setEligibilityWindowCondition(storedEligibility.condition)
    }

    const onDelete = () => {
        setEligibilityWindowCondition('')
        setShowDeleteButton(false)
    }

    const onSubmit = async (event: FormEvent) => {
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

        const updatedEligibilities: SelfServiceConfigurationFilter[] = []
        let hasUpdatedEligibility = false

        configuration.return_order_policy.eligibilities?.forEach(
            (eligibility: SelfServiceConfigurationFilter) => {
                if (
                    eligibility.key === FilterKeyEnum.ORDER_CREATED_AT ||
                    eligibility.key === FilterKeyEnum.ORDER_DELIVERED_AT
                ) {
                    if (eligibilityWindowCondition) {
                        updatedEligibilities.push(
                            updatedEligibilityWindowCondition
                        )
                        hasUpdatedEligibility = true
                    }
                } else {
                    updatedEligibilities.push(eligibility)
                }
            }
        )
        if (!hasUpdatedEligibility && eligibilityWindowCondition) {
            updatedEligibilities.push(updatedEligibilityWindowCondition)
        }

        try {
            const res = await updateSelfServiceConfiguration({
                ...configuration,
                return_order_policy: {
                    ...configuration.return_order_policy,
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
                                to={`/app/settings/self-service/${integrationType}/${shopName}/preferences`}
                            >
                                {shopName}
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Return</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container fluid className={settingsCss.pageContainer}>
                <Row>
                    <Col>
                        <div className="mb-3">
                            <h4 className={css.returnsPolicyTitle}>Return</h4>
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
                                                onChange={(condition) => {
                                                    setEligibilityWindowCondition(
                                                        condition as string
                                                    )
                                                    setShowLessThan(true)
                                                }}
                                            />
                                            {showLessThan ? (
                                                <>
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
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
                                                            event: ChangeEvent<HTMLInputElement>
                                                        ) => {
                                                            setEligibilityWindowConditionValue(
                                                                event.target
                                                                    .value
                                                            )
                                                        }}
                                                    />
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        day(s) ago
                                                    </div>
                                                    {showDeleteButton ? (
                                                        <div
                                                            onClick={onDelete}
                                                            className={
                                                                css.deleteButton
                                                            }
                                                        >
                                                            <i className="material-icons red mr-1">
                                                                clear
                                                            </i>
                                                        </div>
                                                    ) : null}
                                                </>
                                            ) : null}
                                        </div>
                                        <Button
                                            className={classNames('mr-2', {
                                                'btn-loading': loading,
                                            })}
                                            isDisabled={
                                                loading || !formHasChanged
                                            }
                                            intent={ButtonIntent.Primary}
                                            type="submit"
                                        >
                                            Save changes
                                        </Button>
                                        <Button
                                            className={classNames({
                                                'btn-loading': loading,
                                            })}
                                            isDisabled={
                                                loading || !formHasChanged
                                            }
                                            intent={ButtonIntent.Secondary}
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

export default ReturnsPolicyView
