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
    Container,
    Form,
} from 'reactstrap'

import {TIMES_BEFORE_SPLIT} from '../../../../../../config'
import {updateOrCreateIntegration} from '../../../../../../state/integrations/actions'
import {hoursToSeconds} from '../../../../../../utils'
import PageHeader from '../../../../../common/components/PageHeader'
import BooleanField from '../../../../../common/forms/BooleanField'
import InputField from '../../../../../common/forms/InputField'
import FacebookIntegrationNavigation from '../FacebookIntegrationNavigation'


type Props = {
    updateOrCreateIntegration: (Map<*,*>) => Promise<*>,
    integration: Map<*,*>
}

type State = {
    autoResponderEnabled: boolean,
    autoResponderText: string,
    timeBeforeSplit: number,
    isUpdating: boolean
}

@connect(null, {
    updateOrCreateIntegration
})
export default class FacebookIntegrationPreferences extends React.Component<Props, State> {
    state = {
        autoResponderEnabled: false,
        autoResponderText: 'We\'re away at the moment. Leave us your email and we\'ll follow up shortly.',
        timeBeforeSplit: hoursToSeconds(24),
        isUpdating: false
    }

    isInitialized: boolean = false

    _initState = (integration: Map<*,*>) => {
        this.setState(_omitBy({
            autoResponderEnabled: integration.getIn(['meta', 'preferences', 'auto_responder', 'enabled']),
            autoResponderText: integration.getIn(['meta', 'preferences', 'auto_responder', 'text']),
            timeBeforeSplit: integration.getIn(['meta', 'preferences', 'time_before_split'])
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
                    time_before_split: parseInt(this.state.timeBeforeSplit)
                }
            })
        })

        await updateOrCreateIntegration(payload)

        return this.setState({isUpdating: false})
    }

    render() {
        const {autoResponderEnabled, autoResponderText, isUpdating, timeBeforeSplit} = this.state
        const {integration} = this.props

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/facebook">
                                Facebook, Messenger & Instagram
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.getIn(['facebook', 'name'])}
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Preferences
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <FacebookIntegrationNavigation integration={integration}/>

                <Container
                    fluid
                    className="page-container"
                >
                    <Form onSubmit={this._submitPreferences}>
                        <div className="mb-4">
                            <h4>
                                Away auto-responder
                            </h4>

                            <p>
                                When your team is not available to chat, you can configure an auto-response for{' '}
                                your customers.
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

                        <div className="mb-4">
                            <h4>
                                Inactivity settings
                            </h4>
                            <InputField
                                type="select"
                                name="timeBeforeSplit"
                                label="Inactivity period between chat tickets"
                                help="After a certain period without any new message on a chat ticket, Gorgias will
                                create a new ticket the next time the customer contacts you over chat."
                                value={timeBeforeSplit}
                                onChange={(timeBeforeSplit) => this.setState({timeBeforeSplit})}
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
