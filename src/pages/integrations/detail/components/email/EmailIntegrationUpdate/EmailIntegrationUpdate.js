import React, {PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
import {Loader} from '../../../../../common/components/Loader'
import {InputField} from '../../../../../common/forms'
import Clipboard from 'clipboard'
import css from './EmailIntegrationUpdate.less'
import formSender from '../../../../../common/utils/formSender'
import _capitalize from 'lodash/capitalize'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import {getQueryParam} from '../../../../../../utils'
import {logEvent} from '../../../../../../store/middlewares/amplitudeTracker'
import * as notificationActions from '../../../../../../state/notifications/actions'
import * as integrationActions from '../../../../../../state/integrations/actions'
import {GMAIL_IMPORTED_THREADS} from '../../../../../../config'

class EmailIntegrationUpdate extends React.Component {
    state = {
        isCopied: false,
    }

    componentDidMount() {
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
                name: integration.get('name', '')
            })
            this.isInitialized = true
        }
    }

    componentDidUpdate(prevProps) {
        $(this.refs.AddressNameTooltip).popup({
            inline: true,
            position: 'top left',
            offset: -11
        })
        // activate copy to clipboard button only for email integration
        if (this.props.integration.get('type') === 'email' &&
            prevProps.integration.get('id') !== this.props.integration.get('id')) {
            const clipboard = new Clipboard('#copy-forwarding-email')
            clipboard.on('success', () => {
                this.setState({isCopied: true})
                setTimeout(() => {
                    this.setState({isCopied: false})
                }, 1500)
            })
        }
    }

    _handleSubmit = (type, values) => {
        const {updateOrCreateIntegration} = this.props.actions

        logEvent('email_integration_save_changes_click')
        return formSender(updateOrCreateIntegration(fromJS({
            id: this.props.integration.get('id'),
            name: values.name
        })))
    }

    _importEmails = () => {
        const {integration, importEmails} = this.props

        if (!confirm('Are you sure you want to import emails?')) {
            return
        }

        logEvent('gmail_integration_import_emails_click')

        return formSender(importEmails(fromJS({
            id: integration.get('id'),
            meta: {
                import_activated: true
            }
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
                            id="copy-forwarding-email"
                            type="button"
                            className="ui light blue right labeled icon button"
                            data-clipboard-target="#forwarding-email"
                        >
                            <i className="copy icon"/>
                            {
                                this.state.isCopied ? 'COPIED!' : 'COPY'
                            }
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    _renderSettings = () => {
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
        const isDeactivated = !!integration.get('deactivated_datetime')
        const isDeleting = loading.get('delete') === integration.get('id')

        return [
            <h2 key="settings-header" className="ui header">
                Settings
            </h2>,
            <form
                key="settings-form"
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
                {isDeactivated && (
                    <a
                        className={classNames('ui basic light blue button')}
                        href={`/integrations/gmail/auth?integration_id=${integration.get('id')}`}
                    >
                        Re-Activate
                    </a>
                )}
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
        ]
    }

    _renderImportation = () => {
        const {integration, loading} = this.props
        const email = integration.getIn(['meta', 'address'], '')
        const importActivated = integration.getIn(['meta', 'import_activated'], false)
        const status = integration.getIn(['meta', 'importation', 'status'], false)
        const mailsImported = integration.getIn(['meta', 'importation', 'count'], 0)

        const isLoading = loading.get('import') === integration.get('id')
        const isImporting = status === 'started' || (importActivated && !status)

        const statusSentence = isImporting
            ? <span>
                We are currently importing emails from <strong>{email}</strong> into Gorgias.
                You can see it's progress here: <Link to="/app/tickets">All tickets</Link>
            </span>
            : <span>Completed: <b>{mailsImported}</b> mails have been imported.</span>

        return [
            <h2 key="importation-header" className="ui header">
                Import {isImporting ? <Loader inline size="mini" className="ml10i"/> : null}
            </h2>,
            <p key="importation-description">
                {importActivated
                    ? statusSentence
                    :
                    <span>
                        We will import the last <b>{GMAIL_IMPORTED_THREADS}</b> emails from <b>{email}</b> into Gorgias.
                    </span>
                }
            </p>,
            !importActivated && (
                <button
                    key="importation-button"
                    onClick={this._importEmails}
                    type="button"
                    className={classNames('ui green button', {
                        loading: isLoading
                    })}
                >
                    Import emails
                </button>
            )
        ]
    }

    render() {
        const {
            integration,
            loading,
        } = this.props

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <div className="ui grid">
                <div className="sixteen wide tablet twelve wide computer column">
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
                                {integration.getIn(['meta', 'address'], false)}
                            </div>
                        </span>
                    </h1>
                </div>
                <div className="ui row pt0i">
                    <div className="sixteen wide tablet seven wide computer column">
                        {integration.get('type') === 'email' && this._renderInstructions()}
                        {integration.get('type') === 'gmail' && this._renderImportation()}
                        {this._renderSettings()}
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
    importEmails: PropTypes.func.isRequired,
    integration: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    pristine: PropTypes.bool.isRequired,
    loading: PropTypes.object.isRequired,
}

const emailIntegrationUpdateComponent = reduxForm({
    form: 'UPDATE_EMAIL_INTEGRATION',
})(EmailIntegrationUpdate)

const mapStateToProps = state => ({
    domain: state.currentAccount.get('domain'),
})

const mapDispatchToProps = {
    importEmails: integrationActions.importEmails,
    notify: notificationActions.notify,
}

export default connect(mapStateToProps, mapDispatchToProps)(emailIntegrationUpdateComponent)
