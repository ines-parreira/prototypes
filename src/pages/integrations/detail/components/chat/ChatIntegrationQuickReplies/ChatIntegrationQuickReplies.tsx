import React, {Component, FormEvent} from 'react'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Form,
    Row,
} from 'reactstrap'
import classnames from 'classnames'

import PageHeader from '../../../../../common/components/PageHeader'
import BooleanField from '../../../../../common/forms/BooleanField.js'
import ListField from '../../../../../common/forms/ListField'
import {updateOrCreateIntegration} from '../../../../../../state/integrations/actions'
import {
    QUICK_REPLIES_DEFAULTS,
    QUICK_REPLIES_MAX_ITEM_LENGTH,
    QUICK_REPLIES_MAX_ITEMS,
} from '../../../../../../config/integrations/smooch_inside'
import ChatIntegrationNavigation from '../ChatIntegrationNavigation'
import ChatIntegrationPreview from '../ChatIntegrationPreview/ChatIntegrationPreview'
import QuickRepliesPreview from '../ChatIntegrationPreview/QuickReplies'
import css from '../../../../../settings/settings.less'

type Props = {
    integration: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    quickReplies: List<string>
    quickRepliesEnabled: boolean
    isUpdating: boolean
    isInitialized: boolean
}

export class ChatIntegrationQuickRepliesComponent extends Component<
    Props,
    State
> {
    state: State = {
        quickReplies: fromJS([]),
        quickRepliesEnabled: false,
        isUpdating: false,
        isInitialized: false,
    }

    _initState = () => {
        const {integration} = this.props
        const quickRepliesState: Map<any, any> =
            integration.getIn(['meta', 'quick_replies']) || fromJS({})
        let quickReplies = quickRepliesState.get('replies') || fromJS([])

        // If quickRepliesState is empty, it means this integration never had any quick replies set for it, so we
        // want to set the default as examples
        if (quickRepliesState.isEmpty()) {
            quickReplies = QUICK_REPLIES_DEFAULTS
        }

        this.setState({
            quickRepliesEnabled: quickRepliesState.get('enabled') || false,
            quickReplies,
            isInitialized: true,
        })
    }

    componentDidMount() {
        if (!this.props.integration.isEmpty() && !this.state.isInitialized) {
            this._initState()
        }
    }

    componentDidUpdate() {
        if (!this.props.integration.isEmpty() && !this.state.isInitialized) {
            this._initState()
        }
    }

    _submit = (event: FormEvent) => {
        event.preventDefault()
        const {updateOrCreateIntegration, integration} = this.props

        this.setState({isUpdating: true})

        const existingMeta: Map<any, any> =
            integration.get('meta') || fromJS({})
        const trimmedQuickReplies = this.state.quickReplies.map(
            (quickReplies) => quickReplies!.trim()
        ) as List<string>

        const payload = fromJS({
            id: integration.get('id'),
            meta: existingMeta.set(
                'quick_replies',
                fromJS({
                    enabled: this.state.quickRepliesEnabled,
                    replies: trimmedQuickReplies.toJS(),
                })
            ),
        })

        this.setState({quickReplies: trimmedQuickReplies})

        return (updateOrCreateIntegration(payload) as Promise<void>)
            .then(() => this.setState({isUpdating: false}))
            .catch(() => this.setState({isUpdating: false}))
    }

    render() {
        const {integration} = this.props
        const {quickRepliesEnabled, isUpdating} = this.state

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
                                <Link
                                    to={`/app/settings/integrations/${
                                        integration.get('type') as string
                                    }`}
                                >
                                    Chat (Deprecated)
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <ChatIntegrationNavigation integration={integration} />

                <Container fluid className={css.pageContainer}>
                    <Row>
                        <Col>
                            <Form onSubmit={this._submit}>
                                <div className="mb-4">
                                    <h4>Quick replies</h4>
                                    <p>
                                        When a customer opens the chat, select
                                        the quick replies the customer can click
                                        on.
                                    </p>

                                    <div className="mb-3">
                                        <BooleanField
                                            name="quickRepliesEnabled"
                                            type="checkbox"
                                            label="Enable quick replies"
                                            value={quickRepliesEnabled}
                                            onChange={(
                                                quickRepliesEnabled: boolean
                                            ) =>
                                                this.setState({
                                                    quickRepliesEnabled,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <ListField
                                    className="mb-5"
                                    items={this.state.quickReplies}
                                    onChange={(quickReplies) =>
                                        this.setState({quickReplies})
                                    }
                                    maxLength={QUICK_REPLIES_MAX_ITEM_LENGTH}
                                    maxItems={QUICK_REPLIES_MAX_ITEMS}
                                />

                                <div>
                                    <Button
                                        type="submit"
                                        color="success"
                                        className={classnames({
                                            'btn-loading': isUpdating,
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
                                introductionText={integration.getIn([
                                    'decoration',
                                    'introduction_text',
                                ])}
                                mainColor={integration.getIn([
                                    'decoration',
                                    'main_color',
                                ])}
                                language={integration.getIn([
                                    'meta',
                                    'language',
                                ])}
                                isOnline
                            >
                                <QuickRepliesPreview
                                    quickReplies={this.state.quickReplies.toJS()}
                                    mainColor={integration.getIn([
                                        'decoration',
                                        'main_color',
                                    ])}
                                />
                            </ChatIntegrationPreview>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}
const connector = connect(null, {
    updateOrCreateIntegration,
})

export default connector(ChatIntegrationQuickRepliesComponent)
