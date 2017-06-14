import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {Field, reduxForm} from 'redux-form'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import _clone from 'lodash/clone'
import _replace from 'lodash/replace'
import Clipboard from 'clipboard'
import {
    Button,
    UncontrolledTooltip,
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Row,
    Col, Card, CardBlock, CardHeader, Alert,
} from 'reactstrap'

import Loader from '../../../../common/components/Loader'
import {logEvent} from '../../../../../store/middlewares/amplitudeTracker'
import {InputField, TextAreaField, ColorField, FileField} from '../../../../common/forms'
import formSender from '../../../../common/utils/formSender'
import ChatIntegrationPreview from './ChatIntegrationPreview'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import AutoResponderSection from '../../../common/AutoResponderSection'

import css from './ChatIntegrationDetail.less'

export const defaultContent = {
    type: 'smooch_inside'
}

const formName = 'smoochInsideIntegration'

class ChatIntegrationDetail extends React.Component {
    constructor(props) {
        super(props)

        // used to know if form has been asynchronously initialized when updating
        this.isInitialized = !props.isUpdate

        // populating new integration form
        if (!props.isUpdate) {
            props.initialize(_clone(defaultContent))
        }

        this.formValues = this._getFormValues(props)

        this.state = {
            isCopied: false,
            isShopifySnippet: false
        }
    }

    componentWillUpdate(nextProps) {
        const {integration, isUpdate, loading} = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration')) {
            this.props.initialize(integration.toJS())
            this.isInitialized = true
        }
    }

    componentWillReceiveProps(nextProps) {
        // getFormValues updates only on next tick:
        // https://github.com/erikras/redux-form/issues/883#issuecomment-216022940
        this.formValues = this._getFormValues(nextProps)
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

    _getFormValues(props) {
        const defaults = {
            name: '',
            decoration: {
                header_color: '',
                header_text: 'We\'re here to chat, so ask us anything!'
            }
        }
        let formValues = fromJS(props.getFormValues(formName) || defaults)

        // decoration can be null
        if (!formValues.get('decoration')) {
            formValues = formValues.set('decoration', fromJS(defaults.decoration))
        }

        return formValues
    }

    _handleSubmit = (values) => {
        let doc = fromJS(defaultContent).mergeDeep(values)

        // if update, set ids for server
        if (this.props.isUpdate) {
            const integration = this.props.integration
            doc = doc.set('id', integration.get('id'))
        }

        return formSender(this.props.actions.updateOrCreateIntegration(doc))
            .then((res) => {
                // reload the form,
                // to reset dirty.
                this.isInitialized = false

                return res
            })
    }

    // removes empty properties from an object
    _cleanOptions(obj, newObj = {}) {
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === 'object') {
                const nested = this._cleanOptions(obj[key])
                // no empty objects
                if (Object.keys(nested).length) {
                    newObj[key] = nested
                }
            } else if (obj[key]) {
                newObj[key] = obj[key]
            }
        })

        return newObj
    }

    _renderSnippet = (integration) => {
        const options = {
            icon: integration.getIn(['decoration', 'icon']),
            headerColor: integration.getIn(['decoration', 'header_color']),
            chatIconColor: integration.getIn(['decoration', 'chat_icon_color']),
            conversationColor: integration.getIn(['decoration', 'conversation_color']),
            smooch: {
                appToken: integration.getIn(['meta', 'app_token']),
                properties: {
                    current_page: 'window.location.href'
                },
                customText: {
                    headerText: integration.getIn(['decoration', 'window_title']),
                    introductionText: integration.getIn(['decoration', 'header_text']),
                    inputPlaceholder: integration.getIn(['decoration', 'input_placeholder']),
                    sendButtonText: integration.getIn(['decoration', 'send_button_text'])
                }
            }
        }

        const cleanOptions = _replace(
            JSON.stringify(this._cleanOptions(options), null, '  '),
            '"window.location.href"',
            'window.location.href'
        )

        let snippet = `<script src="${window.GORGIAS_ASSETS_URL || window.location.origin}/static/public/js/gorgias-chat.js"></script>\n`

        if (!this.state.isShopifySnippet) {
            snippet += '<script>\n'
            snippet += 'document.addEventListener("DOMContentLoaded", function() {\n'
            snippet += `GorgiasChat.init(${cleanOptions})\n`
            snippet += '})\n'
            snippet += '</script>'
        } else {
            const extendedOptions = Object.assign({}, options)
            extendedOptions.smooch.givenName = '{{ customer.name }}'
            extendedOptions.smooch.email = '{{ customer.email }}'

            const cleanExtendedOptions = _replace(
                JSON.stringify(this._cleanOptions(extendedOptions), null, '  '),
                '"window.location.href"',
                'window.location.href'
            )

            snippet += '{% if customer %}\n'
            snippet += '<script>\n'
            snippet += 'document.addEventListener("DOMContentLoaded", function() {\n'
            snippet += `GorgiasChat.init(${cleanExtendedOptions})\n`
            snippet += '})\n'
            snippet += '</script>\n'
            snippet += '{% else %}\n'
            snippet += '<script>\n'
            snippet += 'document.addEventListener("DOMContentLoaded", function() {\n'
            snippet += `GorgiasChat.init(${cleanOptions})\n`
            snippet += '})\n'
            snippet += '</script>\n'
            snippet += '{% endif %}\n'
        }

        return snippet
    }

    _renderInstructions = (isUpdate, isSubmitting) => {
        const {integration, dirty, handleSubmit} = this.props

        if (!isUpdate || !integration.get('id')) {
            return null
        }

        return (
            <div className="mb-4">
                <h3>
                    Setup instructions
                </h3>
                <p>
                    To activate or update the chat, copy the code below and paste it on your website above the <kbd>{'</body>'}</kbd>
                    {' '}tag. If you need help,{' '}
                    <a
                        target="_blank"
                        href="http://docs.gorgias.io/integrations/chat?utm_source=chat_integration"
                        onClick={() => {
                            logEvent('Clicked see chat tutorial')
                        }}
                    >
                        follow this tutorial
                    </a>
                    {' '}or{' '}
                    <a
                        target="_blank"
                        href="https://calendly.com/romainl/30"
                        onClick={() => {
                            logEvent('Clicked book a setup call to add chat')
                        }}
                    >
                    book a 5min setup call
                    </a>
                    .
                </p>
                <div className={css.snippet}>
                    {
                        dirty && (
                            <div
                                className={classnames(css.update, 'ui yellow message d-flex flex-column justify-content-center')}
                            >
                                <div className="d-inline-block">
                                    Save the changes you made to this integration before getting the new code.

                                    <Button
                                        type="button"
                                        color="secondary"
                                        className={classnames('ml-2', {
                                            'btn-loading': isSubmitting,
                                        })}
                                        onClick={handleSubmit(this._handleSubmit)}
                                        disabled={isSubmitting}
                                    >
                                        Save changes
                                    </Button>
                                </div>
                            </div>
                        )
                    }

                    <Card>
                        <CardHeader>
                            <Button
                                type="button"
                                color={this.state.isShopifySnippet ? 'link' : 'info'}
                                onClick={() => this.setState({isShopifySnippet: false})}
                            >
                                Standard code
                            </Button>
                            <Button
                                type="button"
                                color={this.state.isShopifySnippet ? 'info' : 'link'}
                                className="ml-2"
                                onClick={() => this.setState({isShopifySnippet: true})}
                            >
                                Shopify code
                            </Button>
                        </CardHeader>

                        <CardBlock style={{padding: 0}}>
                            <Alert color="info" style={{margin: 0}}>
                                <pre
                                    style={{
                                        display: 'flex',
                                        height: '200px',
                                        color: 'inherit'
                                    }}
                                    id="chat-snippet"
                                >
                                    {this._renderSnippet(integration)}
                                </pre>
                            </Alert>
                        </CardBlock>
                    </Card>

                    <Button
                        id="copy-chat-snippet"
                        type="button"
                        color="info"
                        className={css.copy}
                        data-clipboard-target="#chat-snippet"
                    >
                        <i className="copy icon mr-2" />
                        {this.state.isCopied ? 'COPIED!' : 'COPY'}
                    </Button>
                </div>
            </div>
        )
    }

    render() {
        const {actions, handleSubmit, integration, isUpdate, loading, currentUser} = this.props

        const isSubmitting = loading.get('updateIntegration')

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

                <h1>{isUpdate ? `Chat: ${integration.get('name')}` : 'Add new chat'}</h1>

                {this._renderInstructions(isUpdate, isSubmitting)}
                <AutoResponderSection/>

                <Container fluid>
                    <Row>
                        <Col
                            style={{paddingLeft: 0}}
                        >
                            <h3 className="mb-3">
                                Widget settings
                            </h3>

                            <form
                                className="ui form"
                                onSubmit={handleSubmit(this._handleSubmit)}
                            >
                                <div className={css.form}>
                                    <div className={css.fieldset}>
                                        <Field
                                            name="name"
                                            label={(
                                                <span>
                                                Chat title
                                                <i
                                                    id="company-name"
                                                    className="help circle link icon"
                                                />
                                                <UncontrolledTooltip
                                                    placement="top"
                                                    target="company-name"
                                                    delay={0}
                                                >
                                                    Can be set only once! If you want to change the title you will
                                                    have to create another chat
                                                </UncontrolledTooltip>
                                            </span>
                                            )}
                                            placeholder="Ex: Company Support"
                                            required
                                            component={InputField}
                                            readOnly={isUpdate}
                                        />

                                        <Field
                                            name="decoration.icon"
                                            component={FileField}
                                            accept="image/*"
                                            ratio="square"
                                            label={(
                                                <span>
                                                Company icon
                                                <i
                                                    id="company-icon"
                                                    className="help circle link icon"
                                                />
                                                <UncontrolledTooltip
                                                    placement="top"
                                                    target="company-icon"
                                                    delay={0}
                                                >
                                                    The image must have a square format. Example: 200x200 pixels
                                                </UncontrolledTooltip>
                                            </span>
                                            )}
                                        />

                                        <Field
                                            name="decoration.window_title"
                                            label="Header text"
                                            component={TextAreaField}
                                            rows="2"
                                        />

                                        <Field
                                            name="decoration.header_text"
                                            label="Introduction text"
                                            component={TextAreaField}
                                            rows="2"
                                        />

                                        <Field
                                            name="decoration.input_placeholder"
                                            label="Input placeholder"
                                            component={InputField}
                                            rows="2"
                                        />

                                        <Field
                                            name="decoration.send_button_text"
                                            label="Send button text"
                                            component={InputField}
                                            rows="2"
                                        />

                                        <Field
                                            name="decoration.header_color"
                                            label="Header color"
                                            component={ColorField}
                                        />

                                        <Field
                                            name="decoration.conversation_color"
                                            label="Conversation color"
                                            component={ColorField}
                                        />

                                        <Field
                                            name="decoration.chat_icon_color"
                                            label="Chat icon color"
                                            component={ColorField}
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
                            </form>
                        </Col>
                        <Col
                            style={{padding: 0}}
                        >
                            <h3 className="mb-3">
                                Preview
                            </h3>
                            <ChatIntegrationPreview
                                currentUser={currentUser}
                                name={this.formValues.get('name')}
                                decoration={this.formValues.get('decoration')}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

ChatIntegrationDetail.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    integration: PropTypes.object.isRequired,
    isUpdate: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    getFormValues: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
    dirty: PropTypes.bool.isRequired
}

export default reduxForm({
    form: formName,
})(ChatIntegrationDetail)
