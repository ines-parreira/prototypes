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

import {updateOrCreateIntegration} from '../../../../../../state/integrations/actions'
import PageHeader from '../../../../../common/components/PageHeader'
import BooleanField from '../../../../../common/forms/BooleanField'
import InputField from '../../../../../common/forms/InputField'
import SmoochIntegrationNavigation from '../SmoochIntegrationNavigation'


type Props = {
    updateOrCreateIntegration: (Map<*,*>) => Promise<*>,
    integration: Map<*,*>
}

type State = {
    autoResponderEnabled: boolean,
    autoResponderText: string,
    isUpdating: boolean
}

@connect(null, {
    updateOrCreateIntegration
})
export default class SmoochIntegrationPreferences extends React.Component<Props, State> {
    state = {
        autoResponderEnabled: false,
        autoResponderText: 'We\'re away at the moment. Leave us your email and we\'ll follow up shortly.',
        isUpdating: false
    }

    isInitialized: boolean = false

    _initState = (integration: Map<*,*>) => {
        this.setState(_omitBy({
            autoResponderEnabled: integration.getIn(['meta', 'preferences', 'auto_responder', 'enabled']),
            autoResponderText: integration.getIn(['meta', 'preferences', 'auto_responder', 'text']),
        }, _isUndefined))

        this.isInitialized = true

        console.log('init')
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
                    }
                }
            })
        })

        await updateOrCreateIntegration(payload)

        return this.setState({isUpdating: false})
    }

    render() {
        const {autoResponderEnabled, autoResponderText, isUpdating} = this.state
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
