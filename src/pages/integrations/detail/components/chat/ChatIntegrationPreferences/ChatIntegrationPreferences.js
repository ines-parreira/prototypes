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
    Button, ButtonGroup, Container,
    Form,
} from 'reactstrap'

import {updateOrCreateIntegration} from '../../../../../../state/integrations/actions'
import PageHeader from '../../../../../common/components/PageHeader'
import BooleanField from '../../../../../common/forms/BooleanField'
import InputField from '../../../../../common/forms/InputField'
import ChatIntegrationNavigation from '../ChatIntegrationNavigation'


type Props = {
    updateOrCreateIntegration: (Map<*,*>) => Promise<*>,
    integration: Map<*,*>
}

type State = {
    autoResponderEnabled: boolean,
    autoResponderText: string,

    emailCaptureEnabled: boolean,
    emailCaptureOnlineTriggerText: string,
    emailCaptureOnlineThanksText: string,
    emailCaptureOfflineTriggerText: string,
    emailCaptureOfflineThanksText: string,

    isUpdating: boolean,
    isModifyingOnlineData: boolean
}

@connect(null, {
    updateOrCreateIntegration
})
export default class ChatIntegrationPreferences extends React.Component<Props, State> {
    state = {
        autoResponderEnabled: false,
        autoResponderText: 'We\'re away at the moment. Leave us your email and we\'ll follow up shortly.',

        emailCaptureEnabled: false,
        emailCaptureOnlineTriggerText: 'Leave us your email in case we reply later.',
        emailCaptureOnlineThanksText: 'Thanks! We\'ll email you at {email} if you leave.',
        emailCaptureOfflineTriggerText: 'We\'re away, leave us your email and we\'ll respond shortly.',
        emailCaptureOfflineThanksText: 'Thanks {email}! We\'ll get back to you shortly.',

        isUpdating: false,
        isModifyingOnlineData: true
    }

    isInitialized: boolean = false

    _initState = (integration: Map<*,*>) => {
        const emailCapturePreferences = integration.getIn(['meta', 'preferences', 'email_capture']) || fromJS({})

        this.setState(_omitBy({
            autoResponderEnabled: integration.getIn(['meta', 'preferences', 'auto_responder', 'enabled']),
            autoResponderText: integration.getIn(['meta', 'preferences', 'auto_responder', 'text']),
            emailCaptureEnabled: emailCapturePreferences.get('enabled'),
            emailCaptureOnlineTriggerText: emailCapturePreferences.getIn(['online', 'trigger_text']),
            emailCaptureOnlineThanksText: emailCapturePreferences.getIn(['online', 'thanks_text']),
            emailCaptureOfflineTriggerText: emailCapturePreferences.getIn(['offline', 'trigger_text']),
            emailCaptureOfflineThanksText: emailCapturePreferences.getIn(['offline', 'thanks_text'])
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
                    email_capture: {
                        enabled: this.state.emailCaptureEnabled,
                        online: {
                            trigger_text: this.state.emailCaptureOnlineTriggerText,
                            thanks_text: this.state.emailCaptureOnlineThanksText,
                        },
                        offline: {
                            trigger_text: this.state.emailCaptureOfflineTriggerText,
                            thanks_text: this.state.emailCaptureOfflineThanksText,
                        }
                    }
                }
            })
        })

        await updateOrCreateIntegration(payload)

        return this.setState({isUpdating: false})
    }

    render() {
        const {
            autoResponderEnabled, autoResponderText,
            emailCaptureEnabled, emailCaptureOnlineTriggerText, emailCaptureOnlineThanksText,
            emailCaptureOfflineTriggerText, emailCaptureOfflineThanksText,
            isUpdating,
            isModifyingOnlineData
        } = this.state

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
                    <Form onSubmit={this._submitPreferences}>

                        <div className="mb-4">
                            <h4>
                                Email capture
                            </h4>
                            <p>
                                If a visitor is anonymous, we'll automatically ask for their email address.
                            </p>

                            <div className="mb-3">
                                <BooleanField
                                    name="emailCaptureEnabled"
                                    type="checkbox"
                                    label="Enable email capture"
                                    value={emailCaptureEnabled}
                                    onChange={(value) => this.setState({emailCaptureEnabled: value})}
                                />
                            </div>

                            <ButtonGroup className="mb-3">
                                <Button
                                    type="button"
                                    color={isModifyingOnlineData ? 'info' : 'secondary'}
                                    onClick={() => this.setState({isModifyingOnlineData: true})}
                                >
                                    Online
                                </Button>
                                <Button
                                    type="button"
                                    color={!isModifyingOnlineData ? 'info' : 'secondary'}
                                    onClick={() => this.setState({isModifyingOnlineData: false})}
                                >
                                    Away
                                </Button>
                            </ButtonGroup>

                            {
                                isModifyingOnlineData ? (
                                    <div>
                                        <InputField
                                            type="textarea"
                                            name="emailCaptureOnlineTriggerText"
                                            label="Email capture text"
                                            value={emailCaptureOnlineTriggerText}
                                            onChange={(value) => this.setState({emailCaptureOnlineTriggerText: value})}
                                            rows="3"
                                        />

                                        <InputField
                                            type="textarea"
                                            name="emailCaptureOnlineThanksText"
                                            label="Thanks for your email message"
                                            value={emailCaptureOnlineThanksText}
                                            onChange={(value) => this.setState({emailCaptureOnlineThanksText: value})}
                                            rows="3"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <InputField
                                            type="textarea"
                                            name="emailCaptureOfflineTriggerText"
                                            label="Email capture text"
                                            value={emailCaptureOfflineTriggerText}
                                            onChange={(value) => this.setState({emailCaptureOfflineTriggerText: value})}
                                            rows="3"
                                        />

                                        <InputField
                                            type="textarea"
                                            name="emailCaptureOfflineThanksText"
                                            label="Thanks for your email message"
                                            value={emailCaptureOfflineThanksText}
                                            onChange={(value) => this.setState({emailCaptureOfflineThanksText: value})}
                                            rows="3"
                                        />
                                    </div>
                                )
                            }
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
                </Container>
            </div>
        )
    }
}
