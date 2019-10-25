// @flow
import React from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {fromJS, type Map} from 'immutable'
import _isUndefined from 'lodash/isUndefined'
import _omitBy from 'lodash/omitBy'

import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Container,
    Form,
} from 'reactstrap'

import {
    CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
    getAutoResponderReplyOptions
} from '../../../../../config/integrations'

import {updateOrCreateIntegration} from '../../../../../state/integrations/actions'
import PageHeader from '../../../../common/components/PageHeader'
import ToggleButton from '../../../../common/components/ToggleButton'
import RadioField from '../../../../common/forms/RadioField'

import SmoochIntegrationNavigation from './SmoochIntegrationNavigation'


type Props = {
    updateOrCreateIntegration: (Map<*,*>) => Promise<*>,
    integration: Map<*,*>
}

type State = {
    autoResponderEnabled: boolean,
    autoResponderReply: string,
    isUpdating: boolean,
    isInitialized: boolean
}

export class SmoochIntegrationPreferences extends React.Component<Props, State> {
    state = {
        autoResponderEnabled: CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
        autoResponderReply: CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
        isUpdating: false,
        isInitialized: false
    }

    _initState = (integration: Map<*,*>) => {
        this.setState(_omitBy({
            autoResponderEnabled: integration.getIn(['meta', 'preferences', 'auto_responder', 'enabled']),
            autoResponderReply: integration.getIn(['meta', 'preferences', 'auto_responder', 'reply']),
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

    _setAutoResponderEnabled = (value: boolean) => {
        this.setState({autoResponderEnabled: value})
    }

    _setAutoResponderReply = (value: string) => {
        this.setState({autoResponderReply: value})
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
                    }
                }
            })
        })

        await updateOrCreateIntegration(payload)

        return this.setState({isUpdating: false})
    }

    render() {
        const {autoResponderEnabled, autoResponderReply, isUpdating} = this.state
        const {integration} = this.props

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/smooch">
                                Smooch
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.get('name')}
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Preferences
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <SmoochIntegrationNavigation integration={integration}/>

                <Container
                    fluid
                    className="page-container"
                >
                    <Form onSubmit={this._submitPreferences}>
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
                                    options={getAutoResponderReplyOptions(integration.getIn(['meta', 'language']))}
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
                </Container>
            </div>
        )
    }
}

export default connect(null, {
    updateOrCreateIntegration
})(SmoochIntegrationPreferences)
