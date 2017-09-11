import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {fromJS} from 'immutable'

import {capitalize} from 'lodash'

import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Form,
    FormGroup,
    Label
} from 'reactstrap'

import {TIMES_BEFORE_SPLIT} from '../../../config'

import InputField from '../../common/forms/InputField'
import BooleanField from '../../common/forms/BooleanField'
import {updateOrCreateIntegration} from '../../../state/integrations/actions'

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
        this.setState({
            autoResponderEnabled: integration.getIn(['meta', 'preferences', 'auto_responder', 'enabled'])
                || false,
            autoResponderText: integration.getIn(['meta', 'preferences', 'auto_responder', 'text']) ||
                'We\'re not online at the moment. Leave us your email and we\'ll follow up shortly.',
            timeBeforeSplit: integration.getIn(['meta', 'preferences', 'time_before_split'],
                TIMES_BEFORE_SPLIT[0].value),
            isUpdating: false
        })

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

        const payload = fromJS({
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

        return updateOrCreateIntegration(payload).then(() => this.setState({isUpdating: false}))
    }

    _getDisplayableType = (integrationType) => {
        if (integrationType === 'smooch_inside') {
            return 'chat'
        }

        return integrationType
    }

    render() {
        const {autoResponderEnabled, autoResponderText, isUpdating, timeBeforeSplit} = this.state
        const {integration} = this.props

        return (
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={`/app/integrations/${integration.get('type')}`}>
                            {capitalize(this._getDisplayableType(integration.get('type')))}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        {integration.get('name')}
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        Preferences
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1>
                    Preferences
                </h1>

                <div className="mb-3">
                    <p>
                        When your team is not available to chat, you can configure an auto-response for your customers.
                    </p>
                    <Form onSubmit={this._submitPreferences}>
                        <FormGroup>
                            <Label>
                                Auto-responder status
                            </Label>
                            <BooleanField
                                name="autoResponderEnabled"
                                type="checkbox"
                                label="Enable auto-responder when no agent is available for chat"
                                value={autoResponderEnabled}
                                onChange={value => this.setState({autoResponderEnabled: value})}
                            />
                        </FormGroup>

                        <InputField
                            type="textarea"
                            name="autoResponderText"
                            label="Auto-responder text"
                            value={autoResponderText}
                            onChange={value => this.setState({autoResponderText: value})}
                            rows="3"
                            required
                        />

                        <InputField
                            type="select"
                            name="timeBeforeSplit"
                            label="Inactivity period between chat tickets"
                            help="After a certain period without any new message on a chat ticket, Gorgias will create a new ticket the next time the customer contacts you over chat."
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

                        <div>
                            <Button
                                type="submit"
                                color="primary"
                                className={classnames({
                                    'btn-loading': isUpdating
                                })}
                                disabled={isUpdating}
                            >
                                Save
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}
