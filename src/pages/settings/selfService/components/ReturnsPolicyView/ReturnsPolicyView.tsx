import React, {
    ChangeEvent,
    FormEvent,
    useEffect,
    useMemo,
    useState,
} from 'react'
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
import {useFlags} from 'launchdarkly-react-client-sdk'
import _isEqual from 'lodash/isEqual'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import Loader from 'pages/common/components/Loader/Loader'
import {
    FilterKeyEnum,
    FilterOperatorEnum,
    ReturnAction,
    ReturnActionType,
    ReturnsDropdownOptionsList,
    SelfServiceConfigurationFilter,
} from 'models/selfServiceConfiguration/types'
import {selfServiceConfigurationUpdated} from 'state/entities/selfServiceConfigurations/actions'
import {updateSelfServiceConfiguration} from 'models/selfServiceConfiguration/resources'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {GorgiasChatIntegrationSelfServicePaywall} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import {hasAutomationLegacyFeatures} from 'state/currentAccount/selectors'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import settingsCss from 'pages/settings/settings.less'
import {FeatureFlagKey} from 'config/featureFlags'
import {Integration, IntegrationType} from 'models/integration/types'
import {getIntegrationsByType} from 'state/integrations/selectors'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {useConfigurationData} from '../hooks'
import {ReturnActionSelectField} from './components/ReturnActionSelectField'
import {LOOP_RETURNS_API_URL} from './constants'
import css from './ReturnsPolicyView.less'

const isLoopReturnsIntegration = (integration: Integration) => {
    return integration.http?.url?.startsWith(LOOP_RETURNS_API_URL)
}

export const ReturnsPolicyView = () => {
    const dispatch = useAppDispatch()
    const {shopName, integrationType} = useParams<{
        shopName: string
        integrationType: string
    }>()

    const {isLoadingConfig, configuration} = useConfigurationData()

    const isSelfServiceLoopReturnsFlowEnabled: boolean =
        useFlags()[FeatureFlagKey.SelfServiceLoopReturnsFlow] ?? false

    const getHttpIntegrations = useMemo(
        () => getIntegrationsByType(IntegrationType.Http),
        []
    )

    const hasSelfServiceV1Features = useAppSelector(hasAutomationLegacyFeatures)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const httpIntegrations = useAppSelector(getHttpIntegrations)

    const loopReturnsIntegrations = useMemo(
        () => httpIntegrations.filter(isLoopReturnsIntegration),
        [httpIntegrations]
    )

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
    const [returnAction, setReturnAction] = useState<ReturnAction | null>(null)
    const [storedReturnAction, setStoredReturnAction] =
        useState<ReturnAction | null>(null)

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
        const returnAction = configuration?.return_order_policy.action || null

        setEligibilityWindowCondition(eligibilityFilter?.key || '')
        setEligibilityWindowConditionValue(
            (eligibilityFilter?.value as string) || '1'
        )
        setStoredEligibility({
            value: (eligibilityFilter?.value as string) || '1',
            condition: eligibilityFilter?.key || '',
        })
        setShowDeleteButton(Boolean(eligibilityFilter?.key || ''))
        setReturnAction(returnAction)
        setStoredReturnAction(returnAction)
    }, [
        configuration,
        configuration?.return_order_policy.eligibilities,
        configuration?.return_order_policy.action,
    ])

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

    const isLoopReturnsIntegrationMissing = useMemo(() => {
        if (storedReturnAction?.type !== ReturnActionType.LoopReturns) {
            return false
        }

        return !loopReturnsIntegrations.some(
            (loopReturnsIntegration) =>
                loopReturnsIntegration.id === storedReturnAction.integration_id
        )
    }, [loopReturnsIntegrations, storedReturnAction])

    const [loading, setLoading] = useState(true)

    const formHasChanged =
        storedEligibility.value !== eligibilityWindowConditionValue ||
        storedEligibility.condition !== eligibilityWindowCondition ||
        (isSelfServiceLoopReturnsFlowEnabled &&
            !_isEqual(storedReturnAction, returnAction))

    const onCancel = () => {
        setEligibilityWindowConditionValue(storedEligibility.value)
        setEligibilityWindowCondition(storedEligibility.condition)
        setReturnAction(storedReturnAction)
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

        const updatedEligibilityWindowCondition: SelfServiceConfigurationFilter =
            {
                key: eligibilityWindowCondition,
                value: eligibilityWindowConditionValue || '',
                operator: FilterOperatorEnum.LESS_THAN,
            }

        const updatedEligibilities: SelfServiceConfigurationFilter[] = []
        let hasUpdatedEligibility = false

        configuration.return_order_policy.eligibilities?.forEach(
            (eligibility) => {
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
                    ...(isSelfServiceLoopReturnsFlowEnabled
                        ? {action: returnAction}
                        : {}),
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
                                Self-service Portal in Chat and Help Center.
                                Returns can only be initiated if the order has
                                been delivered.
                            </p>
                            <br></br>
                            {loading || !configuration ? (
                                <Loader />
                            ) : (
                                <Form onSubmit={onSubmit}>
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
                                            value={eligibilityWindowCondition}
                                            options={ReturnsDropdownOptionsList}
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
                                                            event.target.value
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

                                    {isSelfServiceLoopReturnsFlowEnabled && (
                                        <>
                                            <h5
                                                className={
                                                    css.returnMethodTitle
                                                }
                                            >
                                                Return method
                                            </h5>

                                            <ReturnActionSelectField
                                                loopReturnsIntegrations={
                                                    loopReturnsIntegrations
                                                }
                                                value={returnAction}
                                                onChange={setReturnAction}
                                            />

                                            {isLoopReturnsIntegrationMissing && (
                                                <Alert
                                                    icon
                                                    className={
                                                        css.missingLoopReturnsIntegrationAlert
                                                    }
                                                    type={AlertType.Error}
                                                >
                                                    You must have a
                                                    <a
                                                        href="https://www.loopreturns.com/"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        &nbsp;Loop Returns&nbsp;
                                                    </a>
                                                    account and
                                                    <Link to="/app/settings/integrations/app/6193aad6661a2903d5fb9bff">
                                                        &nbsp;HTTP
                                                        integration&nbsp;
                                                    </Link>
                                                    to use this feature
                                                </Alert>
                                            )}
                                        </>
                                    )}
                                    <div className={css.formButtonsContainer}>
                                        <Button
                                            className={classNames('mr-2', {
                                                'btn-loading': loading,
                                            })}
                                            isDisabled={
                                                loading || !formHasChanged
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
                                                loading || !formHasChanged
                                            }
                                            intent="secondary"
                                            onClick={onCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default ReturnsPolicyView
