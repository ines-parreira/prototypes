import React, {PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import {Link, browserHistory, withRouter} from 'react-router'
import Clipboard from 'clipboard'
import {connect} from 'react-redux'
import _capitalize from 'lodash/capitalize'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import {
    Button,
    UncontrolledTooltip,
    Breadcrumb,
    BreadcrumbItem,
} from 'reactstrap'

import {Loader} from '../../../../../common/components/Loader'
import {InputField} from '../../../../../common/forms'
import css from './EmailIntegrationUpdate.less'
import formSender from '../../../../../common/utils/formSender'
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
        const {
            message,
            message_type: type = 'info'
        } = this.props.location.query

        if (message) {
            this.props.notify({
                type,
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

    componentDidUpdate() {
        // activate copy to clipboard button only for email integration
        if (this.props.integration.get('type') === 'email') {
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

        logEvent('Save email integration')
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

        logEvent('Import Gmail emails')

        return formSender(importEmails(fromJS({
            id: integration.get('id'),
            meta: {
                import_activated: true
            }
        })))
    }

    _renderImportation = () => {
        const {integration, loading} = this.props
        const email = integration.getIn(['meta', 'address'], '')
        const importActivated = integration.getIn(['meta', 'import_activated'], false)
        const status = integration.getIn(['meta', 'importation', 'status'], false)
        const mailsImported = integration.getIn(['meta', 'importation', 'count'], 0)

        const isLoading = loading.get('import') === integration.get('id')
        const isImporting = status === 'started' || (importActivated && !status)

        const statusSentence = isImporting ? (
                <span>
                    We are currently importing emails from <strong>{email}</strong> into Gorgias.
                    You can see it's progress here: <Link to="/app/tickets">All tickets</Link>
                </span>
            ) : (
                <span>
                    Completed: <b>{mailsImported}</b> mails have been imported.
                </span>
            )

        return (
            <div>
                <h2 className="ui header">
                    Import {
                    isImporting && (
                        <Loader
                            inline
                            size="mini"
                            className="ml10i"
                        />
                    )
                }
                </h2>
                <p>
                    {
                        importActivated ? statusSentence : (
                                <span>
                                    We will import the last <b>{GMAIL_IMPORTED_THREADS}</b> emails from <b>{email}</b> into Gorgias.
                                </span>
                            )
                    }
                </p>
                {
                    !importActivated && (
                        <Button
                            color="primary"
                            type="button"
                            onClick={this._importEmails}
                            className={classNames({
                                'btn-loading': isLoading,
                            })}
                        >
                            Import emails
                        </Button>
                    )
                }
            </div>
        )
    }

    _renderInstructions = () => {
        const {domain, integration} = this.props
        const address = integration.getIn(['meta', 'address'], '')

        return (
            <div className="ui form">
                <p>
                    Follow
                    {' '}
                    <b>
                        <a target="_blank" href="https://support.google.com/mail/answer/10957?hl=en">
                            this tutorial
                        </a>
                    </b>
                    {' '}
                    to receive emails from <b>{address}</b> in Gorgias, and add the address below as a
                    forwarding address:
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
                        <Button
                            id="copy-forwarding-email"
                            type="button"
                            color="info"
                            data-clipboard-target="#forwarding-email"
                        >
                            <i className="copy icon mr-2" />
                            {this.state.isCopied ? 'COPIED!' : 'COPY'}
                        </Button>
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

        return (
            <div className="mt-4">
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
                            <div>
                                Address name
                                <i
                                    id="address-name"
                                    className="help circle link icon"
                                />
                                <UncontrolledTooltip
                                    placement="top"
                                    target="address-name"
                                    delay={0}
                                >
                                    The name that customers will see when they receive emails from you
                                </UncontrolledTooltip>
                            </div>
                        }
                    />
                    <Button
                        color="primary"
                        disabled={pristine || isSubmitting || isDeleting}
                        className={classNames({
                            'btn-loading': isSubmitting,
                        })}
                    >
                        Save changes
                    </Button>
                    {
                        isDeactivated && (
                            <Button
                                tag={Link}
                                color="success"
                                to={`/integrations/gmail/auth?integration_id=${integration.get('id')}`}
                            >
                                Re-activate
                            </Button>
                        )
                    }
                    <Button
                        type="button"
                        color="danger"
                        disabled={isSubmitting || isDeleting}
                        onClick={() => deleteIntegration(integration, 'email')}
                        className={classNames('pull-right', {
                            'btn-loading': isDeleting
                        })}
                    >
                        Delete email address
                    </Button>
                </form>
            </div>
        )
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
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to="/app/integrations/email">Email</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        {integration.get('name')}
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1>
                    {integration.get('name')}
                </h1>

                <p className="text-faded">
                    {integration.getIn(['meta', 'address'])}
                </p>

                {integration.get('type') === 'email' && this._renderInstructions()}

                {integration.get('type') === 'gmail' && this._renderImportation()}

                {this._renderSettings()}
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
    location: PropTypes.object.isRequired,
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(emailIntegrationUpdateComponent))
