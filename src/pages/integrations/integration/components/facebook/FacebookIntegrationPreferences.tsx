import React, {Component} from 'react'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import {fromJS, Map} from 'immutable'
import _isUndefined from 'lodash/isUndefined'
import _omitBy from 'lodash/omitBy'
import {Breadcrumb, BreadcrumbItem, Container, Form} from 'reactstrap'

import {
    CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
    CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    getAutoResponderReplyOptions,
} from 'config/integrations/index'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import ToggleInput from 'pages/common/forms/ToggleInput'
import css from 'pages/settings/settings.less'
import {updateOrCreateIntegration} from 'state/integrations/actions'

import FacebookIntegrationNavigation from './FacebookIntegrationNavigation'

type Props = {
    integration: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    autoResponderEnabled: boolean
    autoResponderReply: string
    isUpdating: boolean
    isInitialized: boolean
}

export class FacebookIntegrationPreferences extends Component<Props, State> {
    state: State = {
        autoResponderEnabled: CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
        autoResponderReply: CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
        isUpdating: false,
        isInitialized: false,
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

    _setAutoResponderEnabled = (value: boolean) => {
        this.setState({autoResponderEnabled: value})
    }

    _setAutoResponderReply = (value: string) => {
        this.setState({autoResponderReply: value})
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
                },
            }),
        })

        await updateOrCreateIntegration(payload)

        this.setState({isUpdating: false})
    }

    render() {
        const {autoResponderEnabled, autoResponderReply, isUpdating} =
            this.state
        const {integration} = this.props

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    All Apps
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations/facebook">
                                    Facebook, Messenger & Instagram
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.getIn(['meta', 'name'])}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <FacebookIntegrationNavigation integration={integration} />

                <Container fluid className={css.pageContainer}>
                    <Form onSubmit={this._submitPreferences}>
                        <div className="mb-4">
                            <h4>Auto-responder</h4>

                            <div className="mb-3 d-flex align-items-center">
                                <ToggleInput
                                    onClick={this._setAutoResponderEnabled}
                                    isToggled={autoResponderEnabled}
                                />
                                <div className="ml-2">
                                    <b>Enable auto-responder</b>
                                </div>
                            </div>

                            <div className="mb-3">
                                <p
                                    className={classnames({
                                        'text-faded': !autoResponderEnabled,
                                    })}
                                >
                                    <b>
                                        During{' '}
                                        <Link to="/app/settings/business-hours">
                                            Business hours
                                        </Link>
                                    </b>
                                    , tell customers how fast they can expect a
                                    response with an auto-responder:
                                </p>
                                <RadioFieldSet
                                    className="mb-3"
                                    options={getAutoResponderReplyOptions(
                                        integration.getIn(['meta', 'language'])
                                    )}
                                    selectedValue={autoResponderReply}
                                    onChange={this._setAutoResponderReply}
                                    isDisabled={!autoResponderEnabled}
                                />
                                <p
                                    className={classnames({
                                        'text-faded': !autoResponderEnabled,
                                    })}
                                >
                                    This message will be sent in new Messenger
                                    tickets after 30 seconds without replies
                                    from an agent.
                                </p>
                                <p
                                    className={classnames({
                                        'text-faded': !autoResponderEnabled,
                                    })}
                                >
                                    <b>
                                        Outside{' '}
                                        <Link to="/app/settings/business-hours">
                                            Business hours
                                        </Link>
                                    </b>
                                    , Gorgias will automatically tell customers
                                    when they can expect a response.
                                </p>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                intent="primary"
                                className={classnames({
                                    'btn-loading': isUpdating,
                                })}
                                isDisabled={isUpdating}
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

const connector = connect(null, {
    updateOrCreateIntegration,
})

export default connector(FacebookIntegrationPreferences)
