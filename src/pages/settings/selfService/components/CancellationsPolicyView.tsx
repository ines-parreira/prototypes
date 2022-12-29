import React, {FormEvent, useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Form,
    FormGroup,
    FormText,
    Label,
    Row,
} from 'reactstrap'

import classNames from 'classnames'
import {EditorState} from 'draft-js'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {fromJS} from 'immutable'
import DEPRECATED_RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'
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
    AUTOMATED_RESPONSE,
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
import {
    getHasAutomationAddOn,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'
import {GorgiasChatIntegrationSelfServicePaywall} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import settingsCss from 'pages/settings/settings.less'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import {deleteAttachment as deleteAttachmentAction} from 'state/newMessage/actions'

import {FeatureFlagKey} from 'config/featureFlags'
import {convertToHTML} from 'utils/editor'
import {getNewMessageAttachments} from 'state/newMessage/selectors'
import {MAX_AUTOMATED_RESPONSE_LENGTH} from '../constants'
import {useConfigurationData} from './hooks'
import css from './CancellationsPolicyView.less'
import SelfServicePreferencesNavbar from './SelfServicePreferencesNavbar'
import BackButton from './BackButton'
import FlowSelfServicePreview from './FlowSelfServicePreview'

export const CancellationsPolicyView = () => {
    const dispatch = useAppDispatch()
    const {shopName, integrationType} = useParams<{
        shopName: string
        integrationType: string
    }>()

    const {isLoadingConfig, configuration} = useConfigurationData()

    const hasSelfServiceV1Features = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const hasAutomatedResponseOrderManagementFlag =
        useFlags()[FeatureFlagKey.SelfServiceAutomatedResponseOrderManagement]
    const newMessageAttachments = useAppSelector(getNewMessageAttachments)
    const deleteAttachment = (index: number) => {
        dispatch(deleteAttachmentAction(index))
    }

    const [showDeleteButton, setShowDeleteButton] = useState(true)

    const [
        configCancelOrderStatusEligibility,
        setConfigCancelOrderStatusEligibility,
    ] = useState('')

    const [eligibilityWindowOptionValue, setEligibilityWindowOptionValue] =
        useState('')

    const [responseMessageContent, setResponseMessageContent] = useState({
        html: '',
        text: '',
    })

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

        const responseMessageContent =
            configuration?.cancel_order_policy?.action?.response_message_content
        if (responseMessageContent) {
            setResponseMessageContent(responseMessageContent)
        }
    }, [
        configuration,
        configuration?.cancel_order_policy.eligibilities,
        configuration?.cancel_order_policy?.action?.response_message_content,
    ])

    const [isResponseTooLong, setIsResponseTooLong] = useState(false)
    const [isLandingPage, setIsLandingPage] = useState(true)

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
                    action: {
                        type: AUTOMATED_RESPONSE,
                        response_message_content: responseMessageContent,
                    },
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

    const isButtonDisabled =
        loading ||
        isResponseTooLong ||
        (eligibilityWindowOptionValue === configCancelOrderStatusEligibility &&
            responseMessageContent ===
                configuration?.cancel_order_policy?.action
                    ?.response_message_content)

    const handleChange = (value: EditorState) => {
        if (isLandingPage) {
            setIsLandingPage(false)
        }

        const content = value.getCurrentContent()

        setResponseMessageContent((state) => ({
            ...state,
            html: convertToHTML(content),
            text: content.getPlainText(),
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
                            <h4 className={css.cancellationsPolicyTitle}>
                                Cancel order
                            </h4>
                            <p className={css.cancellationsPolicyDescription}>
                                Allow customers to request order cancellations
                                directly from chat and your help center. A
                                cancellation can only be requested if the order
                                hasn't been processed or shipped.{' '}
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://docs.gorgias.com/en-US/self-service-portal-statuses-81862#actions-availability"
                                >
                                    Read more
                                </a>
                            </p>
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
                                        Customers can request a cancellation
                                        when an order meets the following
                                        criteria:
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
                                        {hasAutomatedResponseOrderManagementFlag && (
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
                                                        html: responseMessageContent.html,
                                                    }}
                                                    onChange={handleChange}
                                                    placeholder="Ex: We offer free shipping on all U.S. orders $100+. Shipping rates vary based on weight and delivery destination and is chosen by the customer at checkout. Check out our Shipping & Returns page for more information about shipping rates."
                                                />
                                                <FormText
                                                    color={
                                                        isResponseTooLong
                                                            ? 'danger'
                                                            : 'muted'
                                                    }
                                                >
                                                    {`${
                                                        responseMessageContent
                                                            .text?.length ?? 0
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
                                        <div className={css.buttonWrapper}>
                                            <Button
                                                className={classNames('mr-2', {
                                                    'btn-loading': loading,
                                                })}
                                                isDisabled={isButtonDisabled}
                                                type="submit"
                                            >
                                                Save changes
                                            </Button>
                                            <Button
                                                className={classNames({
                                                    'btn-loading': loading,
                                                })}
                                                isDisabled={isButtonDisabled}
                                                intent="secondary"
                                                onClick={onCancel}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </Form>
                                </>
                            )}
                        </div>
                    </Col>
                    {hasAutomatedResponseOrderManagementFlag && (
                        <Col data-testid="previewColumn">
                            <FlowSelfServicePreview
                                message={
                                    <>
                                        <b>
                                            I’d like to cancel the following
                                            fulfillment:
                                        </b>
                                        <br />
                                        <br />
                                        Fulfillment: <b>#3087-F1</b>
                                        <br />
                                        Item names: <b>item name</b>
                                        <br />
                                        Tracking URL: <b>jsjsj.tracking.com</b>
                                        <br />
                                        Order placed: <b>06/07/2020 17:20</b>
                                        <br />
                                        Shipping address:{' '}
                                        <b>52 Washburn, SF, CA, 94027</b>
                                    </>
                                }
                                responseMessage={fromJS(responseMessageContent)}
                                newMessageAttachments={newMessageAttachments}
                                isLandingPage={isLandingPage}
                                setIsLandingPage={setIsLandingPage}
                            />
                        </Col>
                    )}
                </Row>
            </Container>
        </div>
    )
}

export default CancellationsPolicyView
