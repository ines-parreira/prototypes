// @flow
import React from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {fromJS, type Map} from 'immutable'
import {omitBy as _omitBy, isUndefined as _isUndefined} from 'lodash'

import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Form,
    Row
} from 'reactstrap'

import {
    CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
    CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    getAutoResponderReplyOptions
} from '../../../../../../config/integrations'

import {
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS,
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_OPTIONAL,
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT
} from '../../../../../../config/integrations/smooch_inside'

import {updateOrCreateIntegration} from '../../../../../../state/integrations/actions'
import PageHeader from '../../../../../common/components/PageHeader'
import ToggleButton from '../../../../../common/components/ToggleButton'
import RadioField from '../../../../../common/forms/RadioField'

import ChatIntegrationNavigation from '../ChatIntegrationNavigation'
import ChatIntegrationPreview from '../ChatIntegrationPreview'
import OptionalEmailCapturePreview from '../ChatIntegrationPreview/OptionalEmailCapture'
import RequiredEmailCapturePreview from '../ChatIntegrationPreview/RequiredEmailCapture'
import AutoResponderPreview from '../ChatIntegrationPreview/AutoResponder'


const emailCaptureOptions = [
    {
        value: SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_OPTIONAL,
        label: 'Optional',
        description: 'Leaving your email is optional, everyone can start a conversation. Maximise conversation volume'
    },
    {
        value: SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS,
        label: 'Required only outside business hours',
        description: 'Reduces conversation volume by around 5%'
    },
    {
        value: SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
        label: 'Always required',
        description: 'Reduces conversation volume by around 30%'
    },
]


export const PREVIEW_EMAIL_CAPTURE = 'email-capture'
export const PREVIEW_AUTO_RESPONDER = 'auto-responder'


type Props = {
    updateOrCreateIntegration: (Map<*,*>) => Promise<*>,
    integration: Map<*,*>
}

type State = {
    autoResponderEnabled: boolean,
    autoResponderReply: string,
    emailCaptureEnforcement: string,

    isInitialized: boolean,
    isUpdating: boolean,
    preview: string
}

export class ChatIntegrationPreferences extends React.Component<Props, State> {
    state = {
        autoResponderEnabled: CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
        autoResponderReply: CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
        emailCaptureEnforcement: SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,

        isInitialized: false,
        isUpdating: false,
        preview: PREVIEW_EMAIL_CAPTURE
    }

    _initState = (integration: Map<*,*>) => {
        this.setState(_omitBy({
            autoResponderEnabled: integration.getIn(['meta', 'preferences', 'auto_responder', 'enabled']),
            autoResponderReply: integration.getIn(['meta', 'preferences', 'auto_responder', 'reply'])
                || CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
            emailCaptureEnforcement: integration.getIn(['meta', 'preferences', 'email_capture_enforcement']),
            isInitialized: true
        }, _isUndefined))
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
            preview: PREVIEW_EMAIL_CAPTURE
        })
    }

    _setAutoResponderEnabled = (value: boolean) => {
        this.setState({
            autoResponderEnabled: value,
            preview: value ? PREVIEW_AUTO_RESPONDER : PREVIEW_EMAIL_CAPTURE
        })
    }

    _setAutoResponderReply = (value: string) => {
        this.setState({
            autoResponderReply: value,
            preview: PREVIEW_AUTO_RESPONDER
        })
    }

    _submitPreferences = async (event: SyntheticEvent<*>) => {
        const {updateOrCreateIntegration, integration} = this.props
        event.preventDefault()

        this.setState({isUpdating: true})

        const existingMeta = integration.get('meta') || fromJS({})

        let payload = fromJS({
            id: integration.get('id'),
            meta: existingMeta.mergeDeep({
                preferences: {
                    auto_responder: {
                        enabled: this.state.autoResponderEnabled,
                        reply: this.state.autoResponderReply
                    },
                    email_capture_enforcement: this.state.emailCaptureEnforcement
                }
            })
        })

        await updateOrCreateIntegration(payload)

        this.setState({isUpdating: false})
    }

    render() {
        const {autoResponderEnabled, autoResponderReply, emailCaptureEnforcement, isUpdating, preview} = this.state
        const {integration} = this.props

        const conversationColor = integration.getIn(['decoration', 'conversation_color'], '')
        const language = integration.getIn(['meta', 'language'])

        const isPreviewOnline = preview === PREVIEW_AUTO_RESPONDER
            || emailCaptureEnforcement !== SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS

        const renderPreviewFooter = preview === PREVIEW_AUTO_RESPONDER
            || emailCaptureEnforcement === SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_OPTIONAL

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
        } else if (emailCaptureEnforcement === SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_OPTIONAL) {
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
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/smooch_inside">Chat</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.get('name')}
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Preferences
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <ChatIntegrationNavigation integration={integration}/>

                <Container
                    fluid
                    className="page-container"
                >
                    <Row>
                        <Col>
                            <Form onSubmit={this._submitPreferences}>

                                <div className="mb-4">
                                    <h4>Email capture</h4>
                                    <p>Ask your customers to leave their email before starting a chat</p>
                                    <RadioField
                                        options={emailCaptureOptions}
                                        value={emailCaptureEnforcement}
                                        onChange={this._setEmailCaptureEnforcement}
                                    />
                                </div>

                                <div className="mb-4">
                                    <h4>
                                        Auto-responder
                                    </h4>

                                    <div className="mb-3 d-flex align-items-center">
                                        <ToggleButton
                                            onChange={this._setAutoResponderEnabled}
                                            value={autoResponderEnabled}
                                        />
                                        <div className="ml-2">
                                            <b>Enable auto-responder</b>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <p className={classnames({'text-faded': !autoResponderEnabled})}>
                                            <b>During <Link to="/app/settings/business-hours">Business hours</Link></b>,
                                            tell customers how fast they can expect a response with an auto-responder:
                                        </p>
                                        <RadioField
                                            options={getAutoResponderReplyOptions(language)}
                                            value={autoResponderReply}
                                            onChange={this._setAutoResponderReply}
                                            disabled={!autoResponderEnabled}
                                        />
                                        <p className={classnames({'text-faded': !autoResponderEnabled})}>
                                            This message will be sent in new chat tickets after 30 seconds without
                                            replies from an agent.
                                        </p>
                                        <p className={classnames({'text-faded': !autoResponderEnabled})}>
                                            <b>Outside <Link to="/app/settings/business-hours">Business hours</Link>
                                            </b>, Gorgias will automatically tell customers when they can expect a
                                            response.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <Button
                                        type="submit"
                                        color="success"
                                        className={classnames({
                                            'btn-loading': isUpdating
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
                                introductionText={integration.getIn(['decoration', 'introduction_text'])}
                                offlineIntroductionText={integration.getIn(['decoration', 'offline_introduction_text'])}
                                mainColor={integration.getIn(['decoration', 'main_color'])}
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

export default connect(null, {
    updateOrCreateIntegration
})(ChatIntegrationPreferences)
