import React, {Component, SyntheticEvent} from 'react'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {Breadcrumb, BreadcrumbItem, Button, Container} from 'reactstrap'
import classnames from 'classnames'
import _omit from 'lodash/omit'
import {fromJS, Map} from 'immutable'

import PageHeader from 'pages/common/components/PageHeader'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {updateOrCreateIntegration} from '../../../../../../state/integrations/actions'
import css from '../../../../../settings/settings.less'
import ChatIntegrationNavigation from '../ChatIntegrationNavigation'

type Props = {
    integration: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    integrationName: string
    isInitialized: boolean
    isUpdating: boolean
}

export class ChatIntegrationMigration extends Component<Props, State> {
    state: State = {
        integrationName: '',
        isInitialized: false,
        isUpdating: false,
    }

    _initState = (integration: Map<any, any>) => {
        this.setState({
            integrationName: integration.get('name'),
            isInitialized: true,
        })
    }

    //eslint-disable-next-line @typescript-eslint/require-await
    _migrate = async (event: SyntheticEvent) => {
        event.preventDefault()
        const {integration, updateOrCreateIntegration} = this.props
        this.setState({isUpdating: true})
        // build the application payload based on the current integration to create the new gorgias_chat integration
        const payload = _omit(integration.toJS(), [
            'meta.webhook',
            'meta.script_url',
            'meta.shopify_integration_ids',
            'meta.app_id',
            'meta.app_token',
            'meta.need_scope_update',
            'uri',
            'created_datetime',
            'id',
            'description',
            'updated_datetime',
        ]) as Record<string, unknown> & {meta: Record<string, unknown>}
        payload.type = 'gorgias_chat'

        if (payload.meta.language === 'fr') {
            payload.meta.language = 'fr-FR'
        }

        return (updateOrCreateIntegration(fromJS(payload)) as Promise<void>)
            .then(() => {
                this.setState({isUpdating: false})
            })
            .catch(() => {
                this.setState({isUpdating: false})
            })
    }

    componentDidMount() {
        if (!this.props.integration.isEmpty() && !this.state.isInitialized) {
            this._initState(this.props.integration)
        }
    }

    componentDidUpdate() {
        if (!this.props.integration.isEmpty() && !this.state.isInitialized) {
            this._initState(this.props.integration)
        }
    }

    render() {
        const {isUpdating, integrationName} = this.state
        const {integration} = this.props

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
                                <Link to="/app/settings/integrations/smooch_inside">
                                    Chat (Deprecated)
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>{integrationName}</BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <ChatIntegrationNavigation integration={integration} />

                <Container fluid className={css.pageContainer}>
                    <Alert type={AlertType.Warning} icon className={css.mb16}>
                        A{' '}
                        <Link to="/app/settings/integrations/gorgias_chat">
                            new version of the chat
                        </Link>{' '}
                        with additional features is available, please migrate to
                        the new version by following the steps outlined in{' '}
                        <a
                            href="https://docs.gorgias.com/gorgias-chat/migrating-to-new-chat-integration-beta-version"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            this article
                        </a>
                        .
                    </Alert>

                    <div className="mb-4">
                        <h4>Migration</h4>
                        <p>
                            Click on the button below to automagically{' '}
                            <span role="img" aria-label="spark">
                                ✨
                            </span>{' '}
                            migrate <b>all the settings</b> of your current chat
                            integration to the new chat, this includes
                            Appearance, Preferences, Campaigns & Quick Replies.
                            You will be redirected automatically to the new chat
                            to complete the installation.
                        </p>
                        <p>
                            <span role="img" aria-label="pointing up">
                                👆
                            </span>{' '}
                            Note that you will still{' '}
                            <b>need to go through the installations steps</b>{' '}
                            for the newly set-up chat in your online store and
                            manually deactivate the old chat.{' '}
                            <a
                                href="https://docs.gorgias.com/gorgias-chat/chat-getting-started"
                                title="chat getting started"
                            >
                                Check-out this article
                            </a>{' '}
                            to guide you through the installation steps.
                        </p>
                        <p>
                            Don't hesitate to schedule{' '}
                            <a
                                href="https://calendly.com/gorgias-office-hours"
                                title="gorgias office hours"
                            >
                                an office hour call if you have any questions
                            </a>
                            !
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={this._migrate}
                        color="success"
                        className={classnames({
                            'btn-loading': isUpdating,
                        })}
                        disabled={isUpdating}
                    >
                        Migrate
                    </Button>
                </Container>
            </div>
        )
    }
}

const connector = connect(null, {
    updateOrCreateIntegration,
})

export default connector(ChatIntegrationMigration)
