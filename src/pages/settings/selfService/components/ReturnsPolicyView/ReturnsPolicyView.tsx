import React, {
    ChangeEvent,
    FormEvent,
    useCallback,
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
    FormGroup,
    FormText,
    Input,
    Label,
    Row,
} from 'reactstrap'
import classNames from 'classnames'
import {EditorState} from 'draft-js'
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
import {
    getHasAutomationAddOn,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'
import settingsCss from 'pages/settings/settings.less'
import {FeatureFlagKey} from 'config/featureFlags'
import {Integration, IntegrationType} from 'models/integration/types'
import {getIntegrationsByType} from 'state/integrations/selectors'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import {deleteAttachment as deleteAttachmentAction} from 'state/newMessage/actions'
import {getNewMessageAttachments} from 'state/newMessage/selectors'

import DEPRECATED_RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'
import {convertToHTML} from 'utils/editor'
import {useConfigurationData} from '../hooks'
import SelfServicePreferencesNavbar from '../SelfServicePreferencesNavbar'
import BackButton from '../BackButton'
import {MAX_AUTOMATED_RESPONSE_LENGTH} from '../../constants'
import {ReturnActionSelectField} from './components/ReturnActionSelectField'
import {NewReturnIntegrationModal} from './components/NewReturnIntegrationModal'
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

    const hasAutomatedResponseOrderManagementFlag =
        useFlags()[FeatureFlagKey.SelfServiceAutomatedResponseOrderManagement]

    const newMessageAttachments = useAppSelector(getNewMessageAttachments)
    const deleteAttachment = (index: number) => {
        dispatch(deleteAttachmentAction(index))
    }

    const getHttpIntegrations = useMemo(
        () => getIntegrationsByType(IntegrationType.Http),
        []
    )

    const [isLandingPage, setIsLandingPage] = useState(true)
    const [isResponseTooLong, setIsResponseTooLong] = useState(false)

    const hasSelfServiceV1Features = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )
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

    const [
        showEligibilityWindowDeleteButton,
        setShowEligibilityWindowDeleteButton,
    ] = useState(true)
    const [showReturnActionDeleteButton, setShowReturnActionDeleteButton] =
        useState(true)
    const [showLessThan, setShowLessThan] = useState(false)
    const [
        isNewReturnIntegrationModalOpen,
        setIsNewReturnIntegrationModalOpen,
    ] = useState(false)

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
        setShowEligibilityWindowDeleteButton(
            Boolean(eligibilityFilter?.key || '')
        )
        setShowReturnActionDeleteButton(Boolean(returnAction))
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

    const onEligibilityWindowDelete = () => {
        setEligibilityWindowCondition('')
        setShowEligibilityWindowDeleteButton(false)
    }

    const onReturnActionDelete = () => {
        setReturnAction(null)
        setShowReturnActionDeleteButton(false)
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

    const handleCreateNewLoopReturnsIntegrationClick = useCallback(() => {
        setIsNewReturnIntegrationModalOpen(true)
    }, [])
    const handleNewReturnIntegrationModalClose = useCallback(() => {
        setIsNewReturnIntegrationModalOpen(false)
    }, [])
    const handleNewReturnIntegration = useCallback(() => {
        const loopReturnsIntegration = [...loopReturnsIntegrations]
            .sort((a, b) => a.id - b.id)
            .pop() as Integration

        setReturnAction({
            type: ReturnActionType.LoopReturns,
            integration_id: loopReturnsIntegration.id,
        })
        handleNewReturnIntegrationModalClose()
    }, [loopReturnsIntegrations, handleNewReturnIntegrationModalClose])

    const handleAutomatedResponseChange = (value: EditorState) => {
        if (isLandingPage) {
            setIsLandingPage(false)
        }

        const content = value.getCurrentContent()

        setReturnAction((state) => ({
            ...state,
            type: ReturnActionType.AutomatedResponse,
            response_message_content: {
                html: convertToHTML(content),
                text: content.getPlainText(),
            },
        }))

        if (
            content.getPlainText().length > MAX_AUTOMATED_RESPONSE_LENGTH &&
            !isResponseTooLong
        ) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Maximum number of characters exceeded. Please review your message',
                })
            )
        }

        setIsResponseTooLong(
            content.getPlainText().length > MAX_AUTOMATED_RESPONSE_LENGTH
                ? true
                : false
        )
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
                        <BreadcrumbItem>{shopName}</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <SelfServicePreferencesNavbar />
            <Container fluid className={settingsCss.pageContainer}>
                <Row>
                    <Col>
                        <BackButton
                            path={`/app/settings/self-service/${integrationType}/${shopName}/preferences/order-management`}
                        >
                            Back to Order management flows
                        </BackButton>
                        <div className="mb-3">
                            <h4 className={css.returnsPolicyTitle}>
                                Return order
                            </h4>
                            <p>
                                Allow customers to request returns directly from
                                chat and your help center. Returns can only be
                                requested if the order has been delivered.{' '}
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://docs.gorgias.com/en-US/self-service-portal-statuses-81862#actions-availability"
                                >
                                    Read more
                                </a>
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
                                        Customers can request a return when an
                                        order meets the following criteria:
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
                                                {showEligibilityWindowDeleteButton ? (
                                                    <div
                                                        onClick={
                                                            onEligibilityWindowDelete
                                                        }
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

                                            <div className="d-inline-flex align-items-center w-100">
                                                <ReturnActionSelectField
                                                    loopReturnsIntegrations={
                                                        loopReturnsIntegrations
                                                    }
                                                    value={returnAction}
                                                    onChange={setReturnAction}
                                                    onCreateNewLoopReturnsIntegrationClick={
                                                        handleCreateNewLoopReturnsIntegrationClick
                                                    }
                                                />

                                                {showReturnActionDeleteButton && (
                                                    <div
                                                        onClick={
                                                            onReturnActionDelete
                                                        }
                                                        className={
                                                            css.deleteButton
                                                        }
                                                    >
                                                        <i className="material-icons red mr-1">
                                                            clear
                                                        </i>
                                                    </div>
                                                )}
                                            </div>

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

                                            <NewReturnIntegrationModal
                                                isOpen={
                                                    isNewReturnIntegrationModalOpen
                                                }
                                                onClose={
                                                    handleNewReturnIntegrationModalClose
                                                }
                                                onCreate={
                                                    handleNewReturnIntegration
                                                }
                                            />
                                        </>
                                    )}

                                    {hasAutomatedResponseOrderManagementFlag &&
                                        returnAction?.type ===
                                            ReturnActionType.AutomatedResponse && (
                                            <FormGroup>
                                                <Label
                                                    for="responseText"
                                                    className="control-label"
                                                >
                                                    Response text
                                                </Label>
                                                <p>
                                                    After customers request a
                                                    return in chat, reply with
                                                    an automated message.
                                                </p>
                                                <DEPRECATED_RichField
                                                    value={{
                                                        html: returnAction
                                                            .response_message_content
                                                            ?.html,
                                                    }}
                                                    onChange={
                                                        handleAutomatedResponseChange
                                                    }
                                                    placeholder="Add a response"
                                                />
                                                <FormText
                                                    color={
                                                        isResponseTooLong
                                                            ? 'danger'
                                                            : 'muted'
                                                    }
                                                >
                                                    {`${
                                                        returnAction
                                                            .response_message_content
                                                            ?.text?.length ?? 0
                                                    }/${MAX_AUTOMATED_RESPONSE_LENGTH} characters`}
                                                </FormText>
                                                <TicketAttachments
                                                    removable
                                                    attachments={
                                                        newMessageAttachments
                                                    }
                                                    deleteAttachment={
                                                        deleteAttachment
                                                    }
                                                    className="p-2 d-flex flex-wrap"
                                                />
                                            </FormGroup>
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
