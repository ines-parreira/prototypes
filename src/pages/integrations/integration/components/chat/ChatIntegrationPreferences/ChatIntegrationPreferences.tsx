import React, {Component} from 'react'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import _isUndefined from 'lodash/isUndefined'
import _omitBy from 'lodash/omitBy'
import {fromJS, Map} from 'immutable'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Form,
    Label,
    Row,
} from 'reactstrap'

import {
    CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
    getAutoResponderReplyOptions,
} from 'config/integrations/index'
import {
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_OPTIONAL,
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS,
} from 'config/integrations/smooch_inside'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import PageHeader from 'pages/common/components/PageHeader'
import Tooltip from 'pages/common/components/Tooltip'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import css from 'pages/settings/settings.less'
import {updateOrCreateIntegration} from 'state/integrations/actions'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {RootState} from 'state/types'
import {EmailIntegration, isEmailIntegration} from 'models/integration/types'
import ChatIntegrationNavigation from '../ChatIntegrationNavigation'
import ChatIntegrationPreview from '../ChatIntegrationPreview/ChatIntegrationPreview'
import AutoResponderPreview from '../ChatIntegrationPreview/AutoResponder'
import OptionalEmailCapturePreview from '../ChatIntegrationPreview/OptionalEmailCapture'
import RequiredEmailCapturePreview from '../ChatIntegrationPreview/RequiredEmailCapture'

const emailCaptureOptions = [
    {
        value: SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_OPTIONAL,
        label: 'Optional',
        description:
            'Leaving your email is optional, everyone can start a conversation. Maximise conversation volume',
    },
    {
        value: SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS,
        label: 'Required only outside business hours',
        description: 'Reduces conversation volume by around 5%',
    },
    {
        value: SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
        label: 'Always required',
        description: 'Reduces conversation volume by around 30%',
    },
]

export const PREVIEW_EMAIL_CAPTURE = 'email-capture'
export const PREVIEW_AUTO_RESPONDER = 'auto-responder'

type Props = {
    integration: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    autoResponderEnabled: boolean
    autoResponderReply: string
    emailCaptureEnforcement: string
    linkedEmailIntegration: number | null
    isInitialized: boolean
    isUpdating: boolean
    preview: string
}

export class ChatIntegrationPreferences extends Component<Props, State> {
    static defaultProps = {
        emailIntegrations: [],
    }

    state: State = {
        autoResponderEnabled: CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
        autoResponderReply: CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
        emailCaptureEnforcement: SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,
        linkedEmailIntegration: null,
        isInitialized: false,
        isUpdating: false,
        preview: PREVIEW_EMAIL_CAPTURE,
    }

    _initState = (integration: Map<any, any>) => {
        this.setState(
            _omitBy(
                {
                    autoResponderEnabled: integration.getIn([
                        'meta',
                        'preferences',
                        'auto_responder',
                        'enabled',
                    ]),
                    autoResponderReply:
                        integration.getIn([
                            'meta',
                            'preferences',
                            'auto_responder',
                            'reply',
                        ]) || CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
                    emailCaptureEnforcement: integration.getIn([
                        'meta',
                        'preferences',
                        'email_capture_enforcement',
                    ]),
                    linkedEmailIntegration: integration.getIn([
                        'meta',
                        'preferences',
                        'linked_email_integration',
                    ]),
                    isInitialized: true,
                },
                _isUndefined
            ) as any
        )
    }

    componentDidMount() {
        if (!this.props.integration.isEmpty()) {
            this._initState(this.props.integration)
        }
    }

    componentDidUpdate() {
        if (!this.state.isInitialized && !this.props.integration.isEmpty()) {
            this._initState(this.props.integration)
        }
    }

    _setEmailCaptureEnforcement = (value: string) => {
        this.setState({
            emailCaptureEnforcement: value,
            preview: PREVIEW_EMAIL_CAPTURE,
        })
    }

    _setAutoResponderEnabled = (value: boolean) => {
        this.setState({
            autoResponderEnabled: value,
            preview: value ? PREVIEW_AUTO_RESPONDER : PREVIEW_EMAIL_CAPTURE,
        })
    }

    _setAutoResponderReply = (value: string) => {
        this.setState({
            autoResponderReply: value,
            preview: PREVIEW_AUTO_RESPONDER,
        })
    }

    _setLinkedEmailIntegration = (integrationId: number) => {
        this.setState({linkedEmailIntegration: integrationId})
    }

    _submitPreferences = async (event: React.SyntheticEvent) => {
        const {updateOrCreateIntegration, integration} = this.props
        event.preventDefault()

        this.setState({isUpdating: true})

        const existingMeta = (integration.get('meta') || fromJS({})) as Map<
            any,
            any
        >

        const payload = fromJS({
            id: integration.get('id'),
            meta: existingMeta.mergeDeep({
                preferences: {
                    auto_responder: {
                        enabled: this.state.autoResponderEnabled,
                        reply: this.state.autoResponderReply,
                    },
                    email_capture_enforcement:
                        this.state.emailCaptureEnforcement,
                    linked_email_integration: this.state.linkedEmailIntegration,
                },
            }),
        })

        await updateOrCreateIntegration(payload)

        this.setState({isUpdating: false})
    }

    render() {
        const {
            autoResponderEnabled,
            autoResponderReply,
            emailCaptureEnforcement,
            isUpdating,
            preview,
            linkedEmailIntegration,
        } = this.state
        const {integration, emailIntegrations: integrations} = this.props
        const emailIntegrations = integrations.filter(
            (integration): integration is EmailIntegration =>
                isEmailIntegration(integration)
        )

        const conversationColor = integration.getIn(
            ['decoration', 'conversation_color'],
            ''
        )
        const language = integration.getIn(['meta', 'language'])

        const isPreviewOnline =
            preview === PREVIEW_AUTO_RESPONDER ||
            emailCaptureEnforcement !==
                SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS

        const renderPreviewFooter =
            preview === PREVIEW_AUTO_RESPONDER ||
            emailCaptureEnforcement ===
                SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_OPTIONAL

        let previewChildren = null

        if (preview === PREVIEW_AUTO_RESPONDER) {
            previewChildren = (
                <AutoResponderPreview
                    conversationColor={conversationColor}
                    name={integration.get('name')}
                    language={language}
                    autoResponderReply={autoResponderReply}
                />
            )
        } else if (
            emailCaptureEnforcement ===
            SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_OPTIONAL
        ) {
            previewChildren = (
                <OptionalEmailCapturePreview
                    conversationColor={conversationColor}
                    name={integration.get('name')}
                    language={language}
                />
            )
        } else {
            previewChildren = (
                <RequiredEmailCapturePreview
                    conversationColor={conversationColor}
                    language={language}
                />
            )
        }

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    Apps & integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations/smooch_inside">
                                    Chat (Deprecated)
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <ChatIntegrationNavigation integration={integration} />

                <Container fluid className={css.pageContainer}>
                    <Row>
                        <Col>
                            <Form onSubmit={this._submitPreferences}>
                                <div className="mb-4">
                                    <h4>
                                        Email capture{' '}
                                        <i
                                            id="email-capture-help"
                                            className="material-icons-outlined"
                                        >
                                            error_outline
                                        </i>
                                        <Tooltip
                                            autohide={false}
                                            delay={100}
                                            target="email-capture-help"
                                            placement="top-start"
                                        >
                                            You can change the email capture
                                            message by adjusting the chat
                                            default text values.{' '}
                                            <a
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href="https://docs.gorgias.com/video-tutorials/change-email-capture-message-on-chat"
                                            >
                                                Read more
                                            </a>
                                        </Tooltip>
                                    </h4>
                                    <p>
                                        Ask your customers to leave their email
                                        before starting a chat
                                    </p>
                                    <RadioFieldSet
                                        options={emailCaptureOptions}
                                        selectedValue={emailCaptureEnforcement}
                                        onChange={
                                            this._setEmailCaptureEnforcement
                                        }
                                    />
                                </div>

                                <div className="mb-4">
                                    <h4>Auto-responder</h4>

                                    <div className="mb-3 d-flex align-items-center">
                                        <ToggleInput
                                            onClick={
                                                this._setAutoResponderEnabled
                                            }
                                            isToggled={autoResponderEnabled}
                                        />
                                        <div className="ml-2">
                                            <b>Enable auto-responder</b>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <p
                                            className={classnames({
                                                'text-faded':
                                                    !autoResponderEnabled,
                                            })}
                                        >
                                            <b>
                                                During{' '}
                                                <Link to="/app/settings/business-hours">
                                                    Business hours
                                                </Link>
                                            </b>
                                            , tell customers how fast they can
                                            expect a response with an
                                            auto-responder:
                                        </p>
                                        <RadioFieldSet
                                            className="mb-2"
                                            options={getAutoResponderReplyOptions(
                                                language
                                            )}
                                            selectedValue={autoResponderReply}
                                            onChange={
                                                this._setAutoResponderReply
                                            }
                                            isDisabled={!autoResponderEnabled}
                                        />
                                        <p
                                            className={classnames({
                                                'text-faded':
                                                    !autoResponderEnabled,
                                            })}
                                        >
                                            This message will be sent in new
                                            chat tickets after 30 seconds
                                            without replies from an agent.
                                        </p>
                                        <p
                                            className={classnames({
                                                'text-faded':
                                                    !autoResponderEnabled,
                                            })}
                                        >
                                            <b>
                                                Outside{' '}
                                                <Link to="/app/settings/business-hours">
                                                    Business hours
                                                </Link>
                                            </b>
                                            , Gorgias will automatically tell
                                            customers when they can expect a
                                            response.
                                        </p>
                                    </div>
                                </div>
                                <h4>Associated email integration</h4>
                                <div className="mb-4">
                                    <p className="mb-3">
                                        If a customer doesn't see your responses
                                        on a chat for 1 hour, Gorgias will
                                        automatically deliver these messages via
                                        email.
                                        <br />
                                        Satisfaction surveys for chat tickets
                                        are also sent over email.
                                    </p>
                                    <Label
                                        className="control-label"
                                        for="linkedEmailIntegration"
                                    >
                                        Email integration used to send these
                                        emails
                                    </Label>
                                    <SelectField
                                        placeholder="Select an email integration"
                                        value={linkedEmailIntegration}
                                        options={emailIntegrations.map(
                                            (integration) => ({
                                                label: `${integration.name} <${integration.meta.address}>`,
                                                value: integration.id,
                                            })
                                        )}
                                        fullWidth
                                        onChange={(integrationId) => {
                                            this._setLinkedEmailIntegration(
                                                integrationId as number
                                            )
                                        }}
                                    />
                                </div>
                                <div>
                                    <Button
                                        type="submit"
                                        color="success"
                                        className={classnames({
                                            'btn-loading': isUpdating,
                                        })}
                                        disabled={isUpdating}
                                    >
                                        Save changes
                                    </Button>
                                </div>
                            </Form>
                        </Col>
                        <Col>
                            <ChatIntegrationPreview
                                name={integration.get('name')}
                                introductionText={integration.getIn([
                                    'decoration',
                                    'introduction_text',
                                ])}
                                offlineIntroductionText={integration.getIn([
                                    'decoration',
                                    'offline_introduction_text',
                                ])}
                                mainColor={integration.getIn([
                                    'decoration',
                                    'main_color',
                                ])}
                                isOnline={isPreviewOnline}
                                language={language}
                                renderFooter={renderPreviewFooter}
                            >
                                {previewChildren}
                            </ChatIntegrationPreview>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        emailIntegrations: getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)(
            state
        ),
    }),
    {
        updateOrCreateIntegration,
    }
)

export default connector(ChatIntegrationPreferences)
