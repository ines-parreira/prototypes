import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {fromJS} from 'immutable'

import {capitalize} from 'lodash'

import {
    Breadcrumb,
    BreadcrumbItem,
    Button, ButtonGroup, Container,
    Form,
} from 'reactstrap'

import {TIMES_BEFORE_SPLIT} from '../../../config'

import InputField from '../../common/forms/InputField'
import BooleanField from '../../common/forms/BooleanField'
import {updateOrCreateIntegration} from '../../../state/integrations/actions'
import {hoursToSeconds} from '../../../utils'
import PageHeader from '../../common/components/PageHeader'
import RealtimeMessagingIntegrationNavigation from './RealtimeMessagingIntegrationNavigation'

@connect(null, {
    updateOrCreateIntegration
})
export default class RealtimeMessagingIntegrationPreferences extends Component {
    static propTypes = {
        updateOrCreateIntegration: PropTypes.func.isRequired,
        integration: PropTypes.object.isRequired
    }

    state = {}

    _initState = (integration) => {
        let defaultTimeBeforeSplit = hoursToSeconds(3)

        if (integration.get('type') === 'facebook') {
            defaultTimeBeforeSplit = hoursToSeconds(24)
        } else if (integration.get('type') === 'smooch-inside') {
            defaultTimeBeforeSplit = hoursToSeconds(6)
        }

        this.setState({
            autoResponderEnabled: integration.getIn(['meta', 'preferences', 'auto_responder', 'enabled'])
            || false,
            autoResponderText: integration.getIn(['meta', 'preferences', 'auto_responder', 'text']) ||
            'We\'re away at the moment. Leave us your email and we\'ll follow up shortly.',
            timeBeforeSplit: integration.getIn(['meta', 'preferences', 'time_before_split'],
                defaultTimeBeforeSplit),
            isUpdating: false,
        })

        if (integration.get('type') === 'smooch_inside') {
            const emailCapturePreferences = integration.getIn(['meta', 'preferences', 'email_capture']) || fromJS({})

            this.setState({
                emailCaptureEnabled: emailCapturePreferences.get('enabled') || false,
                emailCaptureOnlineTriggerText: emailCapturePreferences.getIn(['online', 'trigger_text'])
                || 'Leave us your email in case we reply later.',
                emailCaptureOnlineThanksText: emailCapturePreferences.getIn(['online', 'thanks_text'])
                || 'Thanks! We\'ll email you at {email} if you leave.',
                emailCaptureOfflineTriggerText: emailCapturePreferences.getIn(['offline', 'trigger_text'])
                || 'We\'re away, leave us your email and we\'ll respond shortly.',
                emailCaptureOfflineThanksText: emailCapturePreferences.getIn(['offline', 'thanks_text'])
                || 'Thanks {email}! We\'ll get back to you shortly.',
                isModifyingOnlineData: true
            })
        }

        this.isInitialized = true
    }

    componentDidMount() {
        this.isInitialized = false

        if (!this.props.integration.isEmpty()) {
            this._initState(this.props.integration)
        }
    }

    componentDidUpdate() {
        if (!this.isInitialized && !this.props.integration.isEmpty()) {
            this._initState(this.props.integration)
        }
    }

    _submitPreferences = (event) => {
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
                    time_before_split: parseInt(this.state.timeBeforeSplit)
                }
            })
        })

        if (integration.get('type') === 'smooch_inside') {
            payload = payload.setIn(['meta', 'preferences', 'email_capture'], {
                enabled: this.state.emailCaptureEnabled,
                online: {
                    trigger_text: this.state.emailCaptureOnlineTriggerText,
                    thanks_text: this.state.emailCaptureOnlineThanksText,
                },
                offline: {
                    trigger_text: this.state.emailCaptureOfflineTriggerText,
                    thanks_text: this.state.emailCaptureOfflineThanksText,
                }
            })
        }

        return updateOrCreateIntegration(payload).then(() => this.setState({isUpdating: false}))
    }

    _getDisplayableType = (integrationType) => {
        if (integrationType === 'smooch_inside') {
            return 'Chat'
        } else if (integrationType === 'facebook') {
            return 'Facebook, Messenger & Instagram'
        }

        return capitalize(integrationType)
    }

    render() {
        const {
            autoResponderEnabled, autoResponderText,
            emailCaptureEnabled, emailCaptureOnlineTriggerText, emailCaptureOnlineThanksText,
            emailCaptureOfflineTriggerText, emailCaptureOfflineThanksText,
            isUpdating,
            timeBeforeSplit,
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
                            <Link to={`/app/settings/integrations/${integration.get('type')}`}>
                                {this._getDisplayableType(integration.get('type'))}
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {
                                integration.get('type') === 'facebook'
                                    ? integration.getIn(['facebook', 'name'])
                                    : integration.get('name')
                            }
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Preferences
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <RealtimeMessagingIntegrationNavigation integration={integration}/>

                <Container fluid className="page-container">
                    <Form onSubmit={this._submitPreferences}>

                        {
                            integration.get('type') === 'smooch_inside' && (
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
                                                    onChange={value => this.setState({emailCaptureOnlineTriggerText: value})}
                                                    rows="3"
                                                />

                                                <InputField
                                                    type="textarea"
                                                    name="emailCaptureOnlineThanksText"
                                                    label="Thanks for your email message"
                                                    value={emailCaptureOnlineThanksText}
                                                    onChange={value => this.setState({emailCaptureOnlineThanksText: value})}
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
                                                    onChange={value => this.setState({emailCaptureOfflineTriggerText: value})}
                                                    rows="3"
                                                />

                                                <InputField
                                                    type="textarea"
                                                    name="emailCaptureOfflineThanksText"
                                                    label="Thanks for your email message"
                                                    value={emailCaptureOfflineThanksText}
                                                    onChange={value => this.setState({emailCaptureOfflineThanksText: value})}
                                                    rows="3"
                                                />
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        }

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
                                    onChange={value => this.setState({autoResponderEnabled: value})}
                                />
                            </div>

                            <InputField
                                type="textarea"
                                name="autoResponderText"
                                label="Auto-responder text"
                                value={autoResponderText}
                                onChange={value => this.setState({autoResponderText: value})}
                                rows="3"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <h4>
                                Inactivity settings
                            </h4>
                            <InputField
                                type="select"
                                name="timeBeforeSplit"
                                label="Inactivity period between chat tickets"
                                help="After a certain period without any new message on a chat ticket, Gorgias will create
                                a new ticket the next time the customer contacts you over chat."
                                value={timeBeforeSplit}
                                onChange={timeBeforeSplit => this.setState({timeBeforeSplit})}
                            >
                                {
                                    TIMES_BEFORE_SPLIT.map((interval, idx) => (
                                        <option
                                            key={idx}
                                            value={interval.value}
                                        >
                                            {interval.label}
                                        </option>
                                    ))
                                }
                            </InputField>
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
