import React, {useEffect, useMemo, useState} from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Row,
    Col,
    Form,
    Label,
    FormGroup,
    FormText,
} from 'reactstrap'
import {Link, useParams} from 'react-router-dom'
import {EditorState} from 'draft-js'
import classNames from 'classnames'
import {fromJS, List, Map} from 'immutable'

import {useDispatch} from 'react-redux'
import {deleteAttachment as deleteAttachmentAction} from 'state/newMessage/actions'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import useAppSelector from 'hooks/useAppSelector'
import PageHeader from 'pages/common/components/PageHeader'
import settingsCss from 'pages/settings/settings.less'
import SelfServicePreferencesNavbar from 'pages/settings/selfService/components/SelfServicePreferencesNavbar'
import {GorgiasChatIntegrationSelfServicePaywall} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import {useConfigurationData} from 'pages/settings/selfService/components/hooks'
import history from 'pages/history'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Button from 'pages/common/components/button/Button'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import DEPRECATED_RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'
import Tooltip from 'pages/common/components/Tooltip'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'

import {convertToHTML} from 'utils/editor'

import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import {NEW_MESSAGE_QUICK_RESPONSE_FLOW} from 'state/newMessage/constants'
import {QuickReplyPolicy} from 'models/selfServiceConfiguration/types'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {getNewMessageAttachments} from '../../../../../state/newMessage/selectors'
import QuickResponseSelfServicePreview from './components/QuickResponseSelfServicePreview'
import css from './QuickResponseFlowItem.less'

const MAX_RESPONSE_LENGTH = 5000

type Props = {
    handleSubmit: (args: {
        buttonLabel: string
        responseText: {message: Map<any, any>}
        attachments: List<any>
    }) => Promise<void>
    quickResponseBeingEdited?: QuickReplyPolicy
    handleDelete?: () => void
}

const QuickResponseFlowItem = ({
    handleSubmit,
    quickResponseBeingEdited,
    handleDelete,
}: Props) => {
    const [isLandingPage, setIsLandingPage] = useState(true)
    const dispatch = useDispatch()
    const configuration = useConfigurationData()
    const [buttonLabel, setButtonLabel] = useState(
        quickResponseBeingEdited?.title ?? ''
    )
    const [responseText, setResponseText] = useState<{message: Map<any, any>}>({
        message: fromJS(
            quickResponseBeingEdited?.response_message_content ?? {}
        ),
    })
    const [error, setError] = useState('')
    const [isResponseTooLong, setIsResponseTooLong] = useState(false)

    const baseURL = `/app/settings/self-service/shopify/${
        configuration.integration.getIn(['meta', 'shop_name']) as string
    }/preferences/quick-response`

    const {quickResponseId} = useParams<{
        quickResponseId?: string
    }>()

    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const newMessageAttachments = useAppSelector(getNewMessageAttachments)
    const deleteAttachment = (index: number) => {
        dispatch(deleteAttachmentAction(index))
    }
    const quickResponses = useMemo(() => {
        return configuration.configuration?.quick_response_policies || []
    }, [configuration])

    useEffect(() => {
        dispatch({
            type: NEW_MESSAGE_QUICK_RESPONSE_FLOW,
            attachments:
                quickResponseBeingEdited?.response_message_content.attachments,
        })
    }, [dispatch, quickResponseBeingEdited])

    if (!hasAutomationAddOn) {
        return <GorgiasChatIntegrationSelfServicePaywall />
    }

    const handleButtonLabelChange = (value: string) => {
        if (!isLandingPage) {
            setIsLandingPage(true)
        }
        setButtonLabel(value)
        setError('')
    }

    const handleSubmitWrapper = async (event: React.FormEvent) => {
        event.preventDefault()

        const flowWithTheSameTitle = quickResponses
            .filter((quickResponse) => quickResponse.id !== quickResponseId)
            .find((response) => response.title === buttonLabel)

        if (flowWithTheSameTitle) {
            setError('Flow with the same title already exists')
            return
        }

        await handleSubmit({
            buttonLabel,
            responseText,
            attachments: newMessageAttachments,
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
                        <BreadcrumbItem active>
                            {configuration.integration.getIn([
                                'meta',
                                'shop_name',
                            ])}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <SelfServicePreferencesNavbar />

            <Container fluid className={settingsCss.pageContainer}>
                <Row>
                    <Col data-testid="configurationColumn">
                        <Button
                            onClick={() => history.push(baseURL)}
                            className={css.backButton}
                            fillStyle="ghost"
                            intent="secondary"
                        >
                            <ButtonIconLabel icon="arrow_back">
                                {quickResponseBeingEdited !== undefined
                                    ? 'Edit Flow'
                                    : 'New Flow'}
                            </ButtonIconLabel>
                        </Button>

                        <Form
                            id="quickResponseForm"
                            onSubmit={handleSubmitWrapper}
                        >
                            <DEPRECATED_InputField
                                name="buttonLabel"
                                label="Button label"
                                placeholder="Ex: Do you offer free shipping and returns?"
                                required
                                value={buttonLabel}
                                onChange={handleButtonLabelChange}
                                maxLength={50}
                                autoFocus
                                error={error}
                                help={
                                    !error
                                        ? `${buttonLabel.length}/50 characters`
                                        : undefined
                                }
                                className={css.buttonLabel}
                            />

                            <FormGroup className={css.responseText}>
                                <Label
                                    for="responseText"
                                    className="control-label"
                                >
                                    What response should be sent?
                                    <i
                                        id="response-text-toggle-info"
                                        className={classNames(
                                            'material-icons',
                                            css.tooltipIcon
                                        )}
                                    >
                                        info_outline
                                    </i>
                                    <Tooltip
                                        placement="top-start"
                                        target="response-text-toggle-info"
                                        style={{
                                            textAlign: 'start',
                                            width: 164,
                                        }}
                                    >
                                        This response will be automatically
                                        provided to shoppers when they select
                                        this option in the quick answers section
                                    </Tooltip>
                                </Label>
                                <DEPRECATED_RichField
                                    value={{
                                        html: responseText.message.get('html'),
                                    }}
                                    onChange={(value: EditorState) => {
                                        if (isLandingPage) {
                                            setIsLandingPage(false)
                                        }
                                        const content =
                                            value.getCurrentContent()

                                        setResponseText((state) => ({
                                            ...state,
                                            message: state.message
                                                .set(
                                                    'html',
                                                    convertToHTML(content)
                                                )
                                                .set(
                                                    'text',
                                                    content.getPlainText()
                                                ),
                                        }))

                                        if (
                                            content.getPlainText().length >
                                                MAX_RESPONSE_LENGTH &&
                                            !isResponseTooLong
                                        ) {
                                            dispatch(
                                                notify({
                                                    status: NotificationStatus.Error,
                                                    message:
                                                        'Maximum number of characters exceeded. Please review your message',
                                                })
                                            )
                                        }

                                        setIsResponseTooLong(
                                            content.getPlainText().length >
                                                MAX_RESPONSE_LENGTH
                                                ? true
                                                : false
                                        )
                                    }}
                                    placeholder="Ex: We offer free shipping on all U.S. orders $100+. Shipping rates vary based on weight and delivery destination and is chosen by the customer at checkout. Check out our Shipping & Returns page for more information about shipping rates."
                                />
                                <FormText
                                    color={
                                        isResponseTooLong ? 'danger' : 'muted'
                                    }
                                >
                                    {`${
                                        (
                                            responseText.message.get('text') as
                                                | string
                                                | undefined
                                        )?.length ?? 0
                                    }/${MAX_RESPONSE_LENGTH} characters`}
                                </FormText>
                                <TicketAttachments
                                    removable
                                    attachments={newMessageAttachments}
                                    deleteAttachment={deleteAttachment}
                                    className="p-2 d-flex flex-wrap"
                                />
                            </FormGroup>
                            <div
                                className={
                                    quickResponseBeingEdited !== undefined
                                        ? css.spreadButtons
                                        : css.joinedButtons
                                }
                            >
                                <Button
                                    type="submit"
                                    form="quickResponseForm"
                                    isDisabled={
                                        !!error ||
                                        isResponseTooLong ||
                                        buttonLabel.length === 0
                                    }
                                >
                                    {quickResponseBeingEdited !== undefined
                                        ? 'Save Changes'
                                        : 'Create Flow'}
                                </Button>
                                {quickResponseBeingEdited === undefined ? (
                                    <Button
                                        intent={'secondary'}
                                        color={'secondary'}
                                        onClick={() => {
                                            history.push(baseURL)
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                ) : (
                                    <ConfirmButton
                                        id="delete-flow"
                                        intent="destructive"
                                        confirmationButtonIntent="destructive"
                                        confirmationContent={
                                            <span>
                                                Are you sure you want to delete
                                                this quick response flow?
                                            </span>
                                        }
                                        onConfirm={() => {
                                            handleDelete && handleDelete()
                                            history.push(baseURL)
                                        }}
                                        placement="top"
                                    >
                                        Delete Flow
                                    </ConfirmButton>
                                )}
                            </div>
                        </Form>
                    </Col>

                    <Col data-testid="previewColumn">
                        <div className={css.preview}>
                            <QuickResponseSelfServicePreview
                                quickResponseTitle={buttonLabel || 'Title'}
                                quickResponseMessage={responseText.message}
                                newMessageAttachments={newMessageAttachments}
                                isLandingPage={isLandingPage}
                                setIsLandingPage={setIsLandingPage}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default QuickResponseFlowItem
