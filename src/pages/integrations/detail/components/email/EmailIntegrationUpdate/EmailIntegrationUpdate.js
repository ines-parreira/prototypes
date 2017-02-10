import React, {PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import {Link, browserHistory} from 'react-router'
import {Loader} from '../../../../../common/components/Loader'
import {InputField} from '../../../../../common/components/formFields'
import Clipboard from 'clipboard'
import css from './EmailIntegrationUpdate.less'
import formSender from '../../../../../common/utils/formSender'
import _capitalize from 'lodash/capitalize'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import {getQueryParam} from '../../../../../../utils'
import {logEvent} from '../../../../../../store/middlewares/amplitudeTracker'

class EmailIntegrationUpdate extends React.Component {
    componentDidMount() {
        // activate copy to clipboard button
        const clipboard = new Clipboard('#copy-forwarding-email')
        clipboard.on('success', () => {
            const textNode = document.querySelector('#copy-forwarding-email').childNodes[2]
            textNode.textContent = 'COPIED!'
            setTimeout(() => {
                textNode.textContent = 'COPY'
            }, 1500)
        })

        // display message from url
        const message = getQueryParam('message')
        if (message) {
            this.props.notify({
                type: getQueryParam('message_type') || 'info',
                title: message.replace(/\+/g, ' ')
            })
            // remove error from url
            browserHistory.push(window.location.pathname)
        }
    }

    componentWillUpdate(nextProps) {
        const {integration, loading} = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && !loading.get('integration')) {
            this.props.initialize({
                name: integration.get('name', ''),
            })
            this.isInitialized = true
        }
    }

    componentDidUpdate() {
        $(this.refs.AddressNameTooltip).popup({
            inline: true,
            position: 'top left',
            offset: -11
        })
    }

    _handleSubmit = (type, values) => {
        const {updateOrCreateIntegration} = this.props.actions

        logEvent('email_integration_save_changes_click')
        return formSender(updateOrCreateIntegration(fromJS({
            id: this.props.integration.get('id'),
            name: values.name,
        })))
    }

    _renderInstructions = () => {
        const {domain, integration} = this.props
        const address = integration.getIn(['meta', 'address'], '')

        return (
            <div className="ui form">
                <p>
                    {'Follow '}
                    <b><a target="_blank" href="https://support.google.com/mail/answer/10957?hl=en">
                        this tutorial
                    </a></b>
                    {' to receive emails from '}
                    <b>{address}</b>
                    {' in Gorgias, and add the address below as a forwarding address:'}
                </p>
                <div className={`field ${css.form}`}>
                    <div className="ui action input fluid">
                        <input
                            id="forwarding-email"
                            type="text"
                            value={`${address.split('@')[0]}@${domain}.gorgias.io`}
                            className={`${css['email-input']}`}
                            readOnly
                        />
                        <button
                            id="copy-forwarding-email" type="button"
                            className="ui light blue right labeled icon button"
                            data-clipboard-target="#forwarding-email"
                        >
                            <i className="copy icon"/>
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const {
            domain,
            integration,
            loading,
            pristine,
            handleSubmit,
            actions: {
                deleteIntegration
            }
        } = this.props
        const isSubmitting = loading.get('updateIntegration') === integration.get('id')
        const isDeleting = loading.get('delete') === integration.get('id')

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <div className="ui grid">
                <div className="sixteen wide tablet ten wide computer column">
                    <div className="ui large breadcrumb">
                        <Link to="/app/integrations">Integrations</Link>
                        <i className="right angle icon divider"/>
                        <Link to="/app/integrations/email" className="section">Email</Link>
                        <i className="right angle icon divider"/>
                        <a className="active section">
                            {integration.get('name')}
                        </a>
                    </div>
                    <h1 className="ui header">
                        <span>
                            {integration.get('name')}
                            <div className="body sub header">
                                {integration.getIn(['meta', 'address'], '')}
                            </div>
                        </span>
                    </h1>
                </div>
                <div className="ui row pt0i">
                    <div className="sixteen wide tablet seven wide computer column">
                        {this._renderInstructions()}
                        <h2 className="ui header">
                            Settings
                        </h2>
                        <form
                            className={`ui form ${css.form}`}
                            onSubmit={handleSubmit((values) => this._handleSubmit('email', values))}
                        >
                            <Field
                                type="text"
                                name="name"
                                placeholder={`${_capitalize(domain)} Support`}
                                component={InputField}
                                label={
                                    <span>
                                        Address name
                                        <span
                                            ref="AddressNameTooltip"
                                            className="inverted tooltip"
                                            data-content="The name that customers will see when they receive emails from you."
                                            data-variation="inverted"
                                        >
                                            <i className="help circle link icon"/>
                                        </span>
                                    </span>
                                }
                            />
                            <button
                                disabled={pristine || isSubmitting || isDeleting}
                                className={classNames('ui primary submit button', {
                                    loading: isSubmitting
                                })}
                            >
                                Save changes
                            </button>
                            <button
                                disabled={isSubmitting || isDeleting}
                                onClick={() => deleteIntegration(integration, 'email')}
                                type="button"
                                className={classNames('ui basic light red floated right button', {
                                    loading: isDeleting
                                })}
                            >
                                Delete email address
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

EmailIntegrationUpdate.propTypes = {
    domain: PropTypes.string.isRequired,
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    notify: PropTypes.func.isRequired,
    integration: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    pristine: PropTypes.bool.isRequired,
    loading: PropTypes.object.isRequired,
}

export default reduxForm({
    form: 'UPDATE_EMAIL_INTEGRATION',
})(EmailIntegrationUpdate)
