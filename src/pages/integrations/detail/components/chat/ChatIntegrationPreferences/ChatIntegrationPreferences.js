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
    Row,
} from 'reactstrap'

import {
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS,
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_OPTIONAL,
    SMOOCH_INSIDE_WIDGET_TEXTS_DEFAULTS,
    SMOOCH_INSIDE_WIDGET_TEXTS, SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,
} from '../../../../../../config/integrations/chat'
import {updateOrCreateIntegration} from '../../../../../../state/integrations/actions'
import PageHeader from '../../../../../common/components/PageHeader'
import BooleanField from '../../../../../common/forms/BooleanField'
import InputField from '../../../../../common/forms/InputField'
import RadioField from '../../../../../common/forms/RadioField'

import ChatIntegrationNavigation from '../ChatIntegrationNavigation'
import ChatIntegrationPreview from '../ChatIntegrationPreview'
import OptionalEmailCapturePreview from '../ChatIntegrationPreview/OptionalEmailCapture'
import RequiredEmailCapturePreview from '../ChatIntegrationPreview/RequiredEmailCapture'


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

type Props = {
    updateOrCreateIntegration: (Map<*,*>) => Promise<*>,
    integration: Map<*,*>
}

type State = {
    autoResponderEnabled: boolean,
    autoResponderText: string,

    emailCaptureEnforcement: string,

    isUpdating: boolean
}

@connect(null, {
    updateOrCreateIntegration
})
export default class ChatIntegrationPreferences extends React.Component<Props, State> {
    state = {
        autoResponderEnabled: false,
        autoResponderText: SMOOCH_INSIDE_WIDGET_TEXTS_DEFAULTS.autoResponderText,

        emailCaptureEnforcement: SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,

        isUpdating: false
    }

    isInitialized: boolean = false

    _initState = (integration: Map<*,*>) => {
        const language = integration.getIn(['meta', 'language'])

        this.setState(_omitBy({
            autoResponderEnabled: integration.getIn(['meta', 'preferences', 'auto_responder', 'enabled']),
            autoResponderText: integration.getIn(['meta', 'preferences', 'auto_responder', 'text']) ||
                SMOOCH_INSIDE_WIDGET_TEXTS[language].autoResponderText,
            emailCaptureEnforcement: integration.getIn(['meta', 'preferences', 'email_capture_enforcement']),
        }, _isUndefined))

        this.isInitialized = true
    }

    componentDidMount() {
        if (!this.props.integration.isEmpty()) {
            this._initState(this.props.integration)
        }
    }

    componentDidUpdate() {
        if (!this.isInitialized && !this.props.integration.isEmpty()) {
            this._initState(this.props.integration)
        }
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
                        text: this.state.autoResponderText
                    },
                    email_capture_enforcement: this.state.emailCaptureEnforcement
                }
            })
        })

        await updateOrCreateIntegration(payload)

        return this.setState({isUpdating: false})
    }

    render() {
        const {autoResponderEnabled, autoResponderText, emailCaptureEnforcement, isUpdating} = this.state
        const {integration} = this.props

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
                                        onChange={(value) => this.setState({emailCaptureEnforcement: value})}
                                    />
                                </div>

                                <div className="mb-4">
                                    <h4>
                                        Away auto-responder
                                    </h4>

                                    <p>
                                        When your team is not available to chat, you can configure an auto-response for your{' '}
                                        customers.
                                    </p>

                                    <div className="mb-3">
                                        <BooleanField
                                            name="autoResponderEnabled"
                                            type="checkbox"
                                            label="Enable auto-responder when no agent is available for chat"
                                            value={autoResponderEnabled}
                                            onChange={(value) => this.setState({autoResponderEnabled: value})}
                                        />
                                    </div>

                                    <InputField
                                        type="textarea"
                                        name="autoResponderText"
                                        label="Auto-responder text"
                                        value={autoResponderText}
                                        onChange={(value) => this.setState({autoResponderText: value})}
                                        rows="3"
                                        required
                                    />
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
                                isOnline={emailCaptureEnforcement !== SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS}
                                language={integration.getIn(['meta', 'language'])}
                                renderFooter={emailCaptureEnforcement === SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_OPTIONAL}
                            >
                                {
                                    emailCaptureEnforcement === SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_OPTIONAL ? (
                                        <OptionalEmailCapturePreview
                                            conversationColor={integration.getIn(['decoration', 'conversation_color'])}
                                            name={integration.get('name')}
                                            language={integration.getIn(['meta', 'language'])}
                                        />
                                    ) : (
                                        <RequiredEmailCapturePreview
                                            conversationColor={integration.getIn(['decoration', 'conversation_color'])}
                                            language={integration.getIn(['meta', 'language'])}
                                        />
                                    )
                                }
                            </ChatIntegrationPreview>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}
