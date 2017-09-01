import React, {PropTypes} from 'react'
import {Link, browserHistory, withRouter} from 'react-router'
import Clipboard from 'clipboard'
import {connect} from 'react-redux'
import _capitalize from 'lodash/capitalize'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import {
    Form,
    Button,
    Breadcrumb,
    BreadcrumbItem,
    InputGroup,
    InputGroupButton,
    Alert,
    Input,
    FormGroup,
} from 'reactstrap'

import {isGorgiasSupportAddress} from '../../../../../../utils'
import Loader from '../../../../../common/components/Loader'
import * as segmentTracker from '../../../../../../store/middlewares/segmentTracker'
import * as notificationActions from '../../../../../../state/notifications/actions'
import * as integrationActions from '../../../../../../state/integrations/actions'
import {GMAIL_IMPORTED_THREADS} from '../../../../../../config'
import ConfirmButton from '../../../../../common/components/ConfirmButton'

import InputField from '../../../../../common/forms/InputField'
import BooleanField from '../../../../../common/forms/BooleanField'

class EmailIntegrationUpdate extends React.Component {
    constructor(props) {
        super(props)

        this.state = Object.assign({
            isCopied: false,
            dirty: false,
        }, this._getIntegrationValues(props.integration))
    }

    componentDidMount() {
        // display message from url
        const {
            message,
            message_type: status = 'info'
        } = this.props.location.query

        if (message) {
            this.props.notify({
                status,
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
            this.setState(this._getIntegrationValues(integration))
            this.isInitialized = true
        }
    }

    _getIntegrationValues = (integration) => {
        const data = {
            name: integration.get('name', ''),
            import_spam: integration.getIn(['meta', 'import_spam']) || false
        }

        if (integration.get('type') === 'gmail') {
            data.use_gmail_categories = integration.getIn(['meta', 'use_gmail_categories']) || false
        }
        return data
    }

    _getFormValues = () => {
        const {integration} = this.props
        let form

        form = integration.set('name', this.state.name)
        form = form.setIn(['meta', 'import_spam'], this.state.import_spam)

        if (integration.get('type') === 'gmail') {
            form = form.setIn(['meta', 'use_gmail_categories'], this.state.use_gmail_categories)
        }
        return form
    }

    _clipboardCopy = (button) => {
        if (!button) {
            return
        }

        const clipboard = new Clipboard(button)
        clipboard.on('success', () => {
            this.setState({isCopied: true})
            setTimeout(() => {
                this.setState({isCopied: false})
            }, 1500)
        })
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const {updateOrCreateIntegration} = this.props.actions

        return updateOrCreateIntegration(this._getFormValues())
            .then((res) => {
                this.setState({dirty: false})
                return res
            })
    }

    _importEmails = () => {
        const {integration, importEmails} = this.props

        return importEmails(fromJS({
            id: integration.get('id'),
            meta: {
                import_activated: true
            }
        }))
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
                    Completed: <b>{mailsImported}</b> emails have been imported.
                </span>
            )

        return (
            <div>
                <h2>
                    {
                        isImporting && (
                            <i className="fa fa-fw fa-circle-o-notch fa-spin mr-2" />
                        )
                    }
                    Import
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
                        <ConfirmButton
                            color="primary"
                            loading={isLoading}
                            confirm={this._importEmails}
                            content="Are you sure you want to import emails?"
                        >
                            Import emails
                        </ConfirmButton>
                    )
                }
            </div>
        )
    }

    _renderInstructions = () => {
        const {domain, integration} = this.props
        const address = integration.getIn(['meta', 'address'], '')

        if (isGorgiasSupportAddress(address)) {
            // no need to display instructions for our own support address
            return (
                <Alert color="info">
                    Emails sent to <b>{address}</b> will arrive in the helpdesk, but we recommend
                    using your own company support address.
                </Alert>
            )
        }

        return (
            <div>
                <h3>
                    Setup instructions
                </h3>
                <p>
                    Forward emails from <b>{address}</b> to the address below. Need help? Follow our
                    {' '}
                    <a
                        target="_blank"
                        href="http://docs.gorgias.io/integrations/email"
                        onClick={() => {
                            segmentTracker.logEvent(segmentTracker.EVENTS.EXTERNAL_LINK_CLICKED, {
                                name: 'Step by step instructions in add email integration',
                                url: 'http://docs.gorgias.io/integrations/email',
                            })
                        }}
                    >
                        step by step tutorial
                    </a>
                    .
                </p>
                <InputGroup>
                    <Input
                        id="forwarding-email"
                        type="text"
                        value={`${address.split('@')[0]}@${domain}.gorgias.io`}
                        readOnly
                    />
                    <InputGroupButton>
                        <Button
                            color="info"
                            data-clipboard-target="#forwarding-email"
                            getRef={this._clipboardCopy}
                        >
                            <i className="fa fa-fw fa-files-o mr-2" />
                            {this.state.isCopied ? 'Copied!' : 'Copy'}
                        </Button>
                    </InputGroupButton>
                </InputGroup>
                <br />
                <Alert color="info">
                    We also <strong>highly recommend</strong> you
                    {' '}
                    <a
                        target="_blank"
                        href="http://docs.gorgias.io/integrations/email#improve_email_deliverability_using_spf_and_dkim"
                    >
                        setup SPF
                    </a> so your emails are not flagged as Spam when you send them from Gorgias.
                </Alert>
            </div>
        )
    }

    _renderSettings = () => {
        const {
            domain,
            integration,
            loading,
            actions: {
                deleteIntegration
            }
        } = this.props

        const isSubmitting = loading.get('updateIntegration') === integration.get('id')
        const isDeactivated = !!integration.get('deactivated_datetime')
        const isDeleting = loading.get('delete') === integration.get('id')
        const isGmail = integration.get('type') === 'gmail'
        const {name, use_gmail_categories, import_spam} = this.state

        return (
            <div className="mt-4">
                <h3>
                    Settings
                </h3>
                <Form onSubmit={this._handleSubmit}>
                    <InputField
                        type="text"
                        name="name"
                        label="Address name"
                        placeholder={`${_capitalize(domain)} Support`}
                        required
                        help="The name that customers will see when they receive emails from you"
                        value={name}
                        onChange={value => this.setState({
                            dirty: true,
                            name: value
                        })}
                    />
                    {
                        isGmail && (
                            <FormGroup>
                                <BooleanField
                                    name="use_gmail_categories"
                                    type="checkbox"
                                    label="Tag Gorgias tickets with Gmail categories (Social, Promotions, Updates, Forums)"
                                    value={use_gmail_categories}
                                    onChange={value => this.setState({
                                        dirty: true,
                                        use_gmail_categories: value })}
                                />
                            </FormGroup>
                        )
                    }
                    <FormGroup>
                        <BooleanField
                            name="import_spam"
                            type="checkbox"
                            label="Import spam emails"
                            help="Imported spam emails will be placed in the Spam ticket view and will not be counted in statistics. Spam tickets are automatically deleted after 30 days."
                            value={import_spam}
                            onChange={value => this.setState({
                                dirty: true,
                                import_spam: value
                            })}
                        />
                    </FormGroup>
                    <div>
                        <Button
                            type="submit"
                            color="primary"
                            disabled={!this.state.dirty || isSubmitting || isDeleting}
                            className={classNames({
                                'btn-loading': isSubmitting,
                            })}
                        >
                            Save changes
                        </Button>
                        {
                            isDeactivated && isGmail && (
                                <Button
                                    className="ml-2"
                                    tag="a"
                                    color="success"
                                    href={`/integrations/gmail/auth?integration_id=${integration.get('id')}`}
                                >
                                    Re-activate
                                </Button>
                            )
                        }

                        <ConfirmButton
                            className="pull-right"
                            color="danger"
                            confirm={() => deleteIntegration(integration, 'email')}
                            content="Are you sure you want to delete this integration?"
                        >
                            Delete email address
                        </ConfirmButton>
                    </div>
                </Form>
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
    notify: PropTypes.func.isRequired,
    importEmails: PropTypes.func.isRequired,
    integration: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
    domain: state.currentAccount.get('domain'),
})

const mapDispatchToProps = {
    importEmails: integrationActions.importEmails,
    notify: notificationActions.notify,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EmailIntegrationUpdate))
