import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {Field, reduxForm} from 'redux-form'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import _clone from 'lodash/clone'
import Clipboard from 'clipboard'

import {Loader} from '../../../../common/components/Loader'
import {InputField, TextAreaField, ColorField, FileField} from '../../../../common/forms'
import formSender from '../../../../common/utils/formSender'
import ChatIntegrationPreview from './ChatIntegrationPreview'

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
            isCopied: false
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

    componentDidUpdate() {
        const popupSettings = {
            inline: true,
            position: 'top left',
            offset: -11
        }
        $(this.refs.chatTitleTooltip).popup(popupSettings)
        $(this.refs.companyIconTooltip).popup(popupSettings)
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
                customText: {
                    introductionText: integration.getIn(['decoration', 'header_text'])
                }
            }
        }

        const cleanOptions = JSON.stringify(this._cleanOptions(options), null, '  ')

        let snippet = `<script src="${window.GORGIAS_ASSETS_URL || window.location.origin}/static/public/js/gorgias-chat.js"></script>\n`
        snippet += `<script>\nGorgiasChat.init(${cleanOptions})\n</script>`

        return snippet
    }

    _renderInstructions = (isUpdate, isSubmitting) => {
        const {integration, dirty, handleSubmit} = this.props

        if (!isUpdate || !integration.get('id')) {
            return null
        }

        return (
            <div>
                <h3>
                    Setup instructions
                </h3>

                <p>
                    To add or update the chat to your website, add the following code before the <kbd>{'</body>'}</kbd>
                    on your page:
                </p>
                <div className={css.snippet}>
                    {dirty ? (
                            <div className={classnames(css.update, 'ui yellow message')}>
                                <p>
                                    Save the changes you made to this integration before getting the new code.

                                    <button
                                        type="button"
                                        className={classnames('ui button tiny floated right', {
                                            loading: isSubmitting
                                        })}
                                        onClick={handleSubmit(this._handleSubmit)}
                                        disabled={isSubmitting}
                                    >
                                        Save changes
                                    </button>
                                </p>
                            </div>
                        ) : ''}

                    <textarea
                        className="ui info message"
                        id="chat-snippet"
                        value={this._renderSnippet(integration)}
                        rows="12"
                        readOnly
                    />

                    <button
                        id="copy-chat-snippet"
                        type="button"
                        className={classnames(css.copy, 'ui light blue icon button right labeled')}
                        data-clipboard-target="#chat-snippet"
                    >
                        <i className="copy icon" />
                        {
                            this.state.isCopied ? 'COPIED!' : 'COPY'
                        }
                    </button>
                </div>
                <p>
                    This chat is provided through a 3rd party called Smooch, at no additional cost. You can send user
                    data to better
                    identify who you are talking to. Check out <a href="http://docs.smooch.io/javascript/"
                                                                  target="_blank">their documentation</a> to learn how
                    to do it.
                </p>
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
            <div className="ui grid">
                <div className="sixteen wide tablet eleven wide computer column">

                    <div className="ui large breadcrumb">
                        <Link to="/app/integrations">Integrations</Link>
                        <i className="right angle icon divider" />
                        <Link to="/app/integrations/smooch_inside" className="section">Chat</Link>
                        <i className="right angle icon divider" />
                        <a className="active section">{isUpdate ? integration.get('name') : 'Add integration'}</a>
                    </div>

                    <h1>{isUpdate ? integration.get('name') : 'Add new chat'}</h1>

                    {this._renderInstructions(isUpdate, isSubmitting)}

                    <br />

                    <div className="ui grid">
                        <div className="eight wide column">
                            <h3>
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
                                                    <span ref="chatTitleTooltip">
                                                        <i className="help circle link icon" />
                                                    </span>
                                                    <div className="ui inverted popup">
                                                        Can be set only once! If you want to change the title create
                                                        another chat.
                                                    </div>
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
                                                    <span ref="companyIconTooltip">
                                                        <i className="help circle link icon" />
                                                    </span>
                                                    <div className="ui inverted popup">
                                                        The image must have a square format. Example: 200x200 pixels.
                                                    </div>
                                                </span>
                                            )}
                                        />

                                        <Field
                                            name="decoration.header_text"
                                            label="Header text"
                                            component={TextAreaField}
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

                                <button
                                    className={classnames('ui', 'green', 'button', {loading: isSubmitting})}
                                    disabled={isSubmitting}
                                >
                                    {isUpdate ? 'Save changes' : 'Add new chat'}
                                </button>

                                {
                                    isUpdate && (
                                        <button
                                            className="ui basic light red floated right button"
                                            onClick={() => actions.deleteIntegration(integration)}
                                            type="button"
                                        >
                                            Delete chat
                                        </button>
                                    )
                                }
                            </form>
                        </div>
                        <div className="eight wide column">
                            <h3>Chat Widget Preview</h3>
                            <ChatIntegrationPreview
                                currentUser={currentUser}
                                name={this.formValues.get('name')}
                                decoration={this.formValues.get('decoration')}
                            />
                        </div>
                    </div>
                </div>
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
