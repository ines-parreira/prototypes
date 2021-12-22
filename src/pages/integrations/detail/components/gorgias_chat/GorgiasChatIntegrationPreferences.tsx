import React from 'react'
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
} from '../../../../../config/integrations'
import {
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    getAutoResponderReplyOptions,
} from '../../../../../config/integrations/gorgias_chat'
import {updateOrCreateIntegration} from '../../../../../state/integrations/actions'
import {getIntegrationsByTypes} from '../../../../../state/integrations/selectors'
import PageHeader from '../../../../common/components/PageHeader'
import ToggleButton from '../../../../common/components/ToggleButton'
import Tooltip from '../../../../common/components/Tooltip'
import RadioField from '../../../../common/forms/RadioField'
import SelectField from '../../../../common/forms/SelectField/SelectField'
import {EMAIL_INTEGRATION_TYPES} from '../../../../../constants/integration'
import {RootState} from '../../../../../state/types'
import settingsCss from '../../../../settings/settings.less'

import ChatIntegrationNavigation from './GorgiasChatIntegrationNavigation'
import ChatIntegrationPreview from './GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import OptionalEmailCapturePreview from './GorgiasChatIntegrationPreview/OptionalEmailCapture'
import RequiredEmailCapturePreview from './GorgiasChatIntegrationPreview/RequiredEmailCapture'
import AutoResponderPreview from './GorgiasChatIntegrationPreview/AutoResponder'
import css from './GorgiasChatIntegrationPreferences.less'

const emailCaptureOptions = [
    {
        value: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
        label: 'Optional',
        description:
            'Leaving your email is optional, everyone can start a conversation. Maximise conversation volume',
    },
    {
        value: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS,
        label: 'Required only outside business hours',
        description: 'Reduces conversation volume by around 5%',
    },
    {
        value: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
        label: 'Always required',
        description:
            "Recommended if you can't provide instant replies. Reduces conversation volume by around 30%",
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
    hideOnMobile: boolean
    hideOutsideBusinessHours: boolean
    isInitialized: boolean
    isUpdating: boolean
    preview: string
    linkedEmailIntegration: number | null
}

export class GorgiasChatIntegrationPreferencesComponent extends React.Component<
    Props,
    State
> {
    static defaultProps = {
        emailIntegrations: fromJS([]),
    }

    state = {
        autoResponderEnabled: CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
        autoResponderReply: CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
        emailCaptureEnforcement: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
        linkedEmailIntegration: null,
        hideOnMobile: false,
        hideOutsideBusinessHours: false,
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
                    hideOnMobile: integration.getIn([
                        'meta',
                        'preferences',
                        'hide_on_mobile',
                    ]),
                    hideOutsideBusinessHours: integration.getIn([
                        'meta',
                        'preferences',
                        'hide_outside_business_hours',
                    ]),
                    linkedEmailIntegration: integration.getIn([
                        'meta',
                        'preferences',
                        'linked_email_integration',
                    ]),
                    isInitialized: true,
                },
                _isUndefined
            ) as State
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

    _setHideOnMobile = (value: boolean) => {
        this.setState({
            hideOnMobile: value,
        })
    }

    _setHideOutsideBusinessHours = (value: boolean) => {
        this.setState({
            hideOutsideBusinessHours: value,
        })
    }

    _setLinkedEmailIntegration = (integrationId: number) => {
        this.setState({linkedEmailIntegration: integrationId})
    }

    _submitPreferences = async (event: React.SyntheticEvent) => {
        const {updateOrCreateIntegration, integration} = this.props
        event.preventDefault()

        this.setState({isUpdating: true})

        const existingMeta: Map<any, any> =
            integration.get('meta') || fromJS({})

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
                    hide_on_mobile: this.state.hideOnMobile,
                    hide_outside_business_hours:
                        this.state.hideOutsideBusinessHours,
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
            hideOnMobile,
            hideOutsideBusinessHours,
            isUpdating,
            preview,
            linkedEmailIntegration,
        } = this.state
        const {integration, emailIntegrations} = this.props

        const conversationColor = integration.getIn(
            ['decoration', 'conversation_color'],
            ''
        )
        const language = integration.getIn(['meta', 'language'])
        const position = {
            alignment: integration.getIn(
                ['decoration', 'position', 'alignment'],
                GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.alignment
            ),
            offsetX: integration.getIn(
                ['decoration', 'position', 'offsetX'],
                GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetX
            ),
            offsetY: integration.getIn(
                ['decoration', 'position', 'offsetY'],
                GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetY
            ),
        }

        const isPreviewOnline =
            preview === PREVIEW_AUTO_RESPONDER ||
            emailCaptureEnforcement !==
                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS

        const renderPreviewFooter =
            preview === PREVIEW_AUTO_RESPONDER ||
            emailCaptureEnforcement ===
                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL

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
            GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL
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
                                    Integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations/gorgias_chat">
                                    Chat
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <ChatIntegrationNavigation integration={integration} />

                <Container fluid className={settingsCss.pageContainer}>
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
                                            info
                                        </i>
                                        <Tooltip
                                            autohide={false}
                                            delay={100}
                                            target="email-capture-help"
                                            placement="top-start"
                                            popperClassName={css.tooltip}
                                            innerClassName={
                                                css['tooltip-inner']
                                            }
                                            arrowClassName={
                                                css['tooltip-arrow']
                                            }
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
                                    <RadioField
                                        options={emailCaptureOptions}
                                        value={emailCaptureEnforcement}
                                        onChange={
                                            this._setEmailCaptureEnforcement
                                        }
                                    />
                                </div>

                                <div className="mb-4">
                                    <h4>Hide chat</h4>
                                    <div className="mb-3 d-flex align-items-center">
                                        <ToggleButton
                                            onChange={this._setHideOnMobile}
                                            value={hideOnMobile}
                                        />

                                        <div className="ml-2">
                                            <b>Hide chat on mobile</b>
                                        </div>

                                        <div className="form-text text-muted ml-2">
                                            Remove chat from your website when
                                            customers access via mobile devices
                                        </div>
                                    </div>
                                    <div className="mb-3 d-flex align-items-center">
                                        <ToggleButton
                                            onChange={
                                                this
                                                    ._setHideOutsideBusinessHours
                                            }
                                            value={hideOutsideBusinessHours}
                                        />

                                        <div className="ml-2">
                                            <b>
                                                Hide chat outside of business
                                                hours
                                            </b>
                                            <i
                                                id="hide-outside-business-hours-help"
                                                className={classnames(
                                                    'material-icons-outlined',
                                                    css[
                                                        'icon-hide-outside-business-hours-help'
                                                    ]
                                                )}
                                            >
                                                info
                                            </i>
                                            <Tooltip
                                                target="hide-outside-business-hours-help"
                                                placement="top-start"
                                                popperClassName={css.tooltip}
                                                innerClassName={
                                                    css['tooltip-inner']
                                                }
                                                arrowClassName={
                                                    css['tooltip-arrow']
                                                }
                                            >
                                                Your customers will be notified
                                                in the chat 30 min before the
                                                end of your business hours. For
                                                customers with no active
                                                conversations, the chat will be
                                                hidden immediately. For
                                                customers with an active
                                                conversation, the chat icon will
                                                be hidden 5 min after being
                                                closed.
                                            </Tooltip>
                                        </div>

                                        <div className="form-text text-muted ml-2">
                                            Chat will be removed from your
                                            website after business hours
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4>Auto-responder</h4>

                                    <div className="mb-3 d-flex align-items-center">
                                        <ToggleButton
                                            onChange={
                                                this._setAutoResponderEnabled
                                            }
                                            value={autoResponderEnabled}
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
                                        <RadioField
                                            options={getAutoResponderReplyOptions(
                                                language
                                            )}
                                            value={autoResponderReply}
                                            onChange={
                                                this._setAutoResponderReply
                                            }
                                            disabled={!autoResponderEnabled}
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
                                        options={emailIntegrations
                                            .map(
                                                (
                                                    integration: Map<any, any>
                                                ) => ({
                                                    label:
                                                        `${
                                                            integration.get(
                                                                'name'
                                                            ) as string
                                                        } ` +
                                                        `<${
                                                            integration.getIn([
                                                                'meta',
                                                                'address',
                                                            ]) as string
                                                        }>`,
                                                    value: integration.get(
                                                        'id'
                                                    ),
                                                })
                                            )
                                            .toJS()}
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
                                position={position}
                                renderFooter={renderPreviewFooter}
                                autoResponderEnabled={autoResponderEnabled}
                                autoResponderReply={autoResponderReply}
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

export default connector(GorgiasChatIntegrationPreferencesComponent)
