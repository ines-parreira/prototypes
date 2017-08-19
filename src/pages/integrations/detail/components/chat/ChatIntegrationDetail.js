import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import _pick from 'lodash/pick'
import _merge from 'lodash/merge'
import _defaults from 'lodash/defaults'
import _isEqual from 'lodash/isEqual'
import Clipboard from 'clipboard'
import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Form,
    Row,
    Col,
    Card,
    CardBlock,
    Alert,
} from 'reactstrap'

import {renderCodeSnippet} from './utils'

import * as integrationSelectors from './../../../../../state/integrations/selectors'
import * as integrationHelpers from './../../../../../state/integrations/helpers'

import Loader from '../../../../common/components/Loader'
import ChatIntegrationPreview from './ChatIntegrationPreview'
import AutoResponderSection from '../../../common/AutoResponderSection'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import * as segmentTracker from '../../../../../store/middlewares/segmentTracker'

import InputField from '../../../../common/forms/InputField'
import ColorField from '../../../../common/forms/ColorField'
import FileField from '../../../../common/forms/FileField'

import css from './ChatIntegrationDetail.less'

export const defaultContent = {
    type: 'smooch_inside',
    name: '',
    headerText: 'We\'re here to chat, so ask us anything!',
    introductionText: '',
    inputPlaceholder: 'Type a message...',
    sendButtonText: 'Send',
    headerColor: '#0d87dd',
    conversationColor: '#0d87dd',
    chatIconColor: '#0d87dd',
    icon: ''
}

class ChatIntegrationDetail extends React.Component {
    static propTypes = {
        integration: PropTypes.object.isRequired,
        isUpdate: PropTypes.bool.isRequired,
        actions: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
        currentUser: PropTypes.object.isRequired,

        shopifyIntegrations: PropTypes.object.isRequired
    }

    constructor(props) {
        super(props)

        // used to know if form has been asynchronously initialized when updating
        this.isInitialized = !props.isUpdate
    }

    state = _merge({
        isCopied: false,
        isShopifyInstructions: true,
    }, defaultContent)

    componentWillUpdate(nextProps) {
        const {integration, isUpdate, loading} = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration')) {
            this.setState(this._getIntegration(integration))
            this.isInitialized = true
        }
    }

    componentDidMount() {
        const clipboard = new Clipboard('#copy-chat-snippet')
        clipboard.on('success', () => {
            this.setState({isCopied: true})
            setTimeout(() => {
                this.setState({isCopied: false})
            }, 1500)
        })
    }

    _getIntegration = (integration) => {
        const oldFormat = integration.getIn(['decoration', 'introduction_text']) === null

        // todo(@martin): remove transition state here
        return _defaults({
            name: integration.get('name'),
            headerText: oldFormat ? integration.getIn(['decoration', 'window_title']) : integration.getIn(['decoration', 'header_text']),
            introductionText: oldFormat ? integration.getIn(['decoration', 'header_text']) : integration.getIn(['decoration', 'introduction_text']),
            inputPlaceholder: integration.getIn(['decoration', 'input_placeholder']),
            sendButtonText: integration.getIn(['decoration', 'send_button_text']),
            headerColor: integration.getIn(['decoration', 'header_color']),
            conversationColor: integration.getIn(['decoration', 'conversation_color']),
            chatIconColor: integration.getIn(['decoration', 'chat_icon_color']),
            icon: integration.getIn(['decoration', 'icon'])
        }, defaultContent)
    }

    _isDirty = () => {
        const oldIntegration = this._getIntegration(this.props.integration)
        const newIntegration = _pick(this.state, Object.keys(defaultContent))
        return this.isInitialized && !_isEqual(oldIntegration, newIntegration)
    }

    _isSubmitting = () => {
        const {loading, integration} = this.props
        return loading.get('updateIntegration') === integration.get('id', true)
    }

    _removeFromShopifyStore = (integrationId) => {
        const {integration} = this.props

        const indexToDelete = integration.getIn(['meta', 'shopify_integration_ids'])
            .findIndex((value) => value === integrationId)

        const form = {
            id: integration.get('id'),
            type: integration.get('type'),
            meta: integration.get('meta').deleteIn(['shopify_integration_ids', indexToDelete])
        }

        return this.props.actions.updateOrCreateIntegration(fromJS(form))
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const form = _pick(this.state, ['name', 'type'])
        form.decoration = {
            header_text: this.state.headerText,
            input_placeholder: this.state.inputPlaceholder,
            send_button_text: this.state.sendButtonText,
            conversation_color: this.state.conversationColor,
            chat_icon_color: this.state.chatIconColor,
            header_color: this.state.headerColor,
            introduction_text: this.state.introductionText,
            icon: this.state.icon
        }

        // if update, set ids for server
        if (this.props.isUpdate) {
            form.id = this.props.integration.get('id')
        }

        return this.props.actions.updateOrCreateIntegration(fromJS(form))
            .then(({error} = {}) => {
                if (error) {
                    return
                }

                // reload the integration
                this.isInitialized = false
            })
    }

    _renderInstructions = (isUpdate, isSubmitting) => {
        const {integration, shopifyIntegrations} = this.props
        const dirty = this._isDirty()

        if (!isUpdate || !integration.get('id')) {
            return null
        }

        return (
            <div className={classnames('mt-5', css.instructions)}>
                <h3>Install</h3>
                <div className={classnames('mb-2', css.tabs)}>
                    <Button
                        type="button"
                        color="secondary"
                        onClick={() => this.setState({isShopifyInstructions: true})}
                        active={this.state.isShopifyInstructions}
                        className={classnames(css.tab)}
                    >
                        <img
                            className={css.tabIcon}
                            src={integrationHelpers.getIconFromType('shopify')}
                        />
                        <div>
                            Shopify
                        </div>
                    </Button>

                    <Button
                        type="button"
                        color="secondary"
                        onClick={() => this.setState({isShopifyInstructions: false})}
                        active={!this.state.isShopifyInstructions}
                        className={classnames('ml-2', css.tab)}
                    >
                        <i className={classnames('fa fa-code', css.tabIcon)} aria-hidden/>
                        <div>
                            Javascript
                        </div>
                    </Button>
                </div>

                {
                    this.state.isShopifyInstructions && (
                        <Card>
                            <CardBlock>
                                {
                                    integration.getIn(['meta', 'shopify_integration_ids'], fromJS([]))
                                        .map((integrationId) => {
                                            const shopifyIntegration = shopifyIntegrations.find((integration) => {
                                                return integration.get('id') === integrationId
                                            })

                                            if (!shopifyIntegration) {
                                                return null
                                            }

                                            return (
                                                <p key={integrationId}>
                                                    Chat added on {`${shopifyIntegration.get('name')}`}.{' '}
                                                    <a
                                                        href=""
                                                        onClick={() => this._removeFromShopifyStore(integrationId)}
                                                    >
                                                        Remove
                                                    </a>
                                                </p>
                                            )
                                        })
                                }
                                <Button
                                    color="primary"
                                    onClick={() => browserHistory.push(`/app/integrations/smooch_inside/${integration.get('id')}/install`)}
                                >
                                    Add chat to a store
                                </Button>
                            </CardBlock>
                        </Card>
                    )
                }
                {
                    !this.state.isShopifyInstructions && (
                        <div className={css.snippet}>
                            {
                                dirty && (
                                    <div
                                        className={css.update}
                                    >
                                        <div className="d-inline-block">
                                            Save the changes you made to this integration before getting the new code.

                                            <Button
                                                type="button"
                                                color="secondary"
                                                className={classnames('ml-2', {
                                                    'btn-loading': isSubmitting,
                                                })}
                                                onClick={this._handleSubmit}
                                                disabled={isSubmitting}
                                            >
                                                Save changes
                                            </Button>
                                        </div>
                                    </div>
                                )
                            }
                            <Card>
                                <CardBlock>
                                    <p>
                                        To activate or update the chat, copy the code below and paste it on your website above the
                                        {' '}<kbd>{'</body>'}</kbd>{' '}tag. If you need help,{' '}
                                        <a
                                            target="_blank"
                                            href="http://docs.gorgias.io/integrations/chat?utm_source=chat_integration"
                                            onClick={() => {
                                                segmentTracker.logEvent(segmentTracker.EVENTS.EXTERNAL_LINK_CLICKED, {
                                                    name: 'See chat tutorial',
                                                    url: 'http://docs.gorgias.io/integrations/chat?utm_source=chat_integration',
                                                })
                                            }}
                                        >
                                            follow this tutorial
                                        </a>
                                        {' '}or{' '}
                                        <a
                                            target="_blank"
                                            href="https://calendly.com/romainl/30"
                                            onClick={() => {
                                                segmentTracker.logEvent(segmentTracker.EVENTS.BOOK_CALL_CLICKED, {
                                                    reason: 'Add chat',
                                                })
                                            }}
                                        >
                                            book a 5min setup call
                                        </a>
                                        .
                                    </p>

                                    <Alert color="info" className="m-0">
                                        <pre
                                            style={{
                                                display: 'flex',
                                                height: '200px',
                                                color: 'inherit'
                                            }}
                                            id="chat-snippet"
                                        >
                                            {renderCodeSnippet(integration, this.state.isShopifyInstructions)}
                                        </pre>
                                    </Alert>
                                </CardBlock>
                                <Button
                                    id="copy-chat-snippet"
                                    type="button"
                                    color="info"
                                    className={css.copy}
                                    data-clipboard-target="#chat-snippet"
                                >
                                    <i className="fa fa-fw fa-files-o mr-2" />
                                    {this.state.isCopied ? 'Copied!' : 'Copy'}
                                </Button>
                            </Card>
                        </div>
                    )
                }
            </div>
        )
    }

    render() {
        const {actions, integration, isUpdate, loading, currentUser} = this.props
        const isSubmitting = this._isSubmitting()

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to="/app/integrations/smooch_inside">Chat</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        {isUpdate ? integration.get('name') : 'Add'}
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1>{isUpdate ? integration.get('name') : 'Add new chat'}</h1>

                {
                    isUpdate && (
                        <AutoResponderSection />
                    )
                }

                <Container fluid>
                    <Row>
                        <Col
                            style={{paddingLeft: 0}}
                        >
                            <h3 className="mb-3">
                                Widget settings
                            </h3>

                            <Form
                                className="ui form"
                                onSubmit={this._handleSubmit}
                            >
                                <div className={css.form}>
                                    <div className={css.fieldset}>
                                        <InputField
                                            type="text"
                                            label="Chat title"
                                            help={!isUpdate && 'Can be set only once! If you want to change the title you will have to create another chat'}
                                            value={this.state.name}
                                            onChange={value => this.setState({name: value})}
                                            placeholder="Ex: Company Support"
                                            readOnly={isUpdate}
                                            required
                                        />

                                        <FileField
                                            label="Company icon"
                                            help="The image must have a square format. Example: 200x200 pixels"
                                            value={this.state.icon}
                                            onChange={url => this.setState({icon: url})}
                                            accept="image/*"
                                        />

                                        <InputField
                                            type="textarea"
                                            label="Header text"
                                            value={this.state.headerText}
                                            onChange={value => this.setState({headerText: value})}
                                            rows="2"
                                            required
                                        />

                                        <InputField
                                            type="textarea"
                                            value={this.state.introductionText}
                                            onChange={value => this.setState({introductionText: value})}
                                            label="Introduction text"
                                            rows="2"
                                        />

                                        <InputField
                                            type="text"
                                            value={this.state.inputPlaceholder}
                                            onChange={value => this.setState({inputPlaceholder: value})}
                                            label="Input placeholder"
                                        />

                                        <InputField
                                            type="text"
                                            value={this.state.sendButtonText}
                                            onChange={value => this.setState({sendButtonText: value})}
                                            label="Send button text"
                                        />

                                        <ColorField
                                            value={this.state.headerColor}
                                            onChange={value => this.setState({headerColor: value})}
                                            label="Header color"
                                        />

                                        <ColorField
                                            value={this.state.conversationColor}
                                            onChange={value => this.setState({conversationColor: value})}
                                            label="Conversation color"
                                        />

                                        <ColorField
                                            value={this.state.chatIconColor}
                                            onChange={value => this.setState({chatIconColor: value})}
                                            label="Chat icon color"
                                        />

                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    color="primary"
                                    className={classnames({
                                        'btn-loading': isSubmitting,
                                    })}
                                    disabled={isSubmitting}
                                >
                                    {isUpdate ? 'Save changes' : 'Add new chat'}
                                </Button>

                                {
                                    isUpdate && (
                                        <ConfirmButton
                                            className="pull-right"
                                            color="danger"
                                            outline
                                            confirm={() => actions.deleteIntegration(integration)}
                                            content="Are you sure you want to delete this integration?"
                                        >
                                            Delete chat
                                        </ConfirmButton>
                                    )
                                }
                            </Form>
                        </Col>
                        <Col className="p-0">
                            <ChatIntegrationPreview
                                currentUser={currentUser}
                                name={this.state.name}
                                headerText={this.state.headerText}
                                introductionText={this.state.introductionText}
                                inputPlaceholder={this.state.inputPlaceholder}
                                sendButtonText={this.state.sendButtonText}
                                headerColor={this.state.headerColor}
                                conversationColor={this.state.conversationColor}
                                chatIconColor={this.state.chatIconColor}
                                icon={this.state.icon}
                            />
                        </Col>
                    </Row>
                </Container>

                {isUpdate && this._renderInstructions(isUpdate, isSubmitting)}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        shopifyIntegrations: integrationSelectors.getIntegrationsByTypes('shopify')(state)
    }
}

export default connect(mapStateToProps)(ChatIntegrationDetail)
