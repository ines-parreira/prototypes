// @flow
import React, {type Node} from 'react'
import {Link, withRouter} from 'react-router'
import Clipboard from 'clipboard'
import {connect} from 'react-redux'
import _capitalize from 'lodash/capitalize'
import classNames from 'classnames'
import {fromJS, type Map} from 'immutable'

import {
    Container,
    Form,
    Button,
    Breadcrumb,
    BreadcrumbItem,
    InputGroup,
    InputGroupAddon,
    Alert,
    Input,
    FormGroup,
} from 'reactstrap'

import {
    EMAIL_INTEGRATION_TYPE,
    GMAIL_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
    EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS
} from '../../../../../../constants/integration'
import {getForwardingEmailAddress, getRedirectUri} from '../../../../../../state/integrations/selectors'

import {isGorgiasSupportAddress} from '../../../../../../utils'
import {convertToHTML} from '../../../../../../utils/editor'
import Loader from '../../../../../common/components/Loader'
import * as segmentTracker from '../../../../../../store/middlewares/segmentTracker'
import * as integrationActions from '../../../../../../state/integrations/actions'
import {GMAIL_IMPORTED_THREADS} from '../../../../../../config'
import ConfirmButton from '../../../../../common/components/ConfirmButton'

import InputField from '../../../../../common/forms/InputField'
import BooleanField from '../../../../../common/forms/BooleanField'
import RichFieldWithVariables from '../../../../../common/forms/RichFieldWithVariables'
import PageHeader from '../../../../../common/components/PageHeader'


type Props = {
    domain: string,
    forwardingEmailAddress: string,
    importEmails: (Map<*, *>) => Promise<*>,
    integration: Map<*, *>,
    actions: Object,
    loading: Map<*, *>,
    location: Object,
    gmailRedirectUri: string
}

type State = {
    isCopied: boolean,
    dirty: boolean,
    errors: Object,
    name: string,
    import_spam: boolean,
    use_gmail_categories: boolean,
    signature_text: string,
    signature_html: string
}


class EmailIntegrationUpdate extends React.Component<Props, State> {
    isInitialized: boolean = false

    state = {
        isCopied: false,
        dirty: false,
        errors: {},
        name: '',
        import_spam: false,
        use_gmail_categories: false,
        signature_text: '',
        signature_html: ''
    }

    constructor(props: Props) {
        super(props)

        this.state = {
            ...this.state,
            ...this._getIntegrationValues(props.integration)
        }
    }

    componentWillUpdate(nextProps: Props) {
        const {integration, loading} = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && !loading.get('integration')) {
            this.setState(this._getIntegrationValues(integration))
            this.isInitialized = true
        }
    }

    _getIntegrationValues = (integration: Map<*, *>): Object => {
        return {
            name: integration.get('name', ''),
            import_spam: integration.getIn(['meta', 'import_spam']) || false,
            use_gmail_categories: integration.get('type') === GMAIL_INTEGRATION_TYPE
                ? integration.getIn(['meta', 'use_gmail_categories']) || false
                : false
        }
    }

    _getFormValues = (): Map<*, *> => {
        const {integration} = this.props
        let form

        form = integration
            .set('name', this.state.name)
            .setIn(['meta', 'import_spam'], this.state.import_spam)
            .setIn(['meta', 'signature', 'text'], this.state.signature_text)
            .setIn(['meta', 'signature', 'html'], this.state.signature_html)

        if (integration.get('type') === GMAIL_INTEGRATION_TYPE) {
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

    _gmailImportEmails = () => {
        const {integration, importEmails} = this.props

        return importEmails(fromJS({
            id: integration.get('id'),
            meta: {
                import_activated: true
            }
        }))
    }

    _outlookImportEmails = () => {
        const {integration, importEmails} = this.props

        return importEmails(fromJS({
            id: integration.get('id'),
            meta: integration.get('meta').setIn(['import_state', 'enabled'], true)
        }))
    }

    _renderImport = (
        importActivated: boolean,
        status: string,
        mailsImported: boolean,
        importDescription: Node,
        importMethod: () => Promise<*>
    ) => {
        const {integration, loading} = this.props
        const email = integration.getIn(['meta', 'address'], '')

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
                            <i className="material-icons md-spin mr-2">
                                autorenew
                            </i>
                        )
                    }
                    Import
                </h2>
                <p>
                    {
                        importActivated
                            ? statusSentence
                            : <span>We will import {importDescription} from <b>{email}</b> into Gorgias.</span>
                    }
                </p>
                {
                    !importActivated && (
                        <ConfirmButton
                            color="primary"
                            loading={isLoading}
                            confirm={importMethod}
                            content="Are you sure you want to import emails?"
                        >
                            Import emails
                        </ConfirmButton>
                    )
                }
            </div>
        )
    }

    _gmailRenderImport = () => {
        const {integration} = this.props
        const importActivated = integration.getIn(['meta', 'import_activated'], false)
        const status = integration.getIn(['meta', 'importation', 'status'], false)
        const mailsImported = integration.getIn(['meta', 'importation', 'count'], 0)
        const importDescription = <span>the last <b>{GMAIL_IMPORTED_THREADS}</b> emails</span>
        return this._renderImport(importActivated, status, mailsImported, importDescription, this._gmailImportEmails)
    }

    _outlookRenderImport = () => {
        const {integration} = this.props
        const importActivated = integration.getIn(['meta', 'import_state', 'enabled'], false)
        const status = integration.getIn(['meta', 'import_state', 'is_over'], false)
        const mailsImported = integration.getIn(['meta', 'import_state', 'count'], 0)
        const importDescription = <span>the last <b>year</b> of emails</span>
        return this._renderImport(importActivated, status, mailsImported, importDescription, this._outlookImportEmails)
    }

    _renderInstructions = () => {
        const {forwardingEmailAddress, integration} = this.props
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
                        rel="noopener noreferrer"
                        href="https://docs.gorgias.com/email-integrations/email"
                        onClick={() => {
                            segmentTracker.logEvent(segmentTracker.EVENTS.EXTERNAL_LINK_CLICKED, {
                                name: 'Step by step instructions in add email integration',
                                url: 'https://docs.gorgias.com/email-integrations/email',
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
                        value={forwardingEmailAddress}
                        readOnly
                    />
                    <InputGroupAddon addonType="append">
                        <Button
                            color="primary"
                            data-clipboard-target="#forwarding-email"
                            innerRef={this._clipboardCopy}
                        >
                            <i className="material-icons mr-2">
                                file_copy
                            </i>
                            {this.state.isCopied ? 'Copied!' : 'Copy'}
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
                <br/>
                <Alert color="info">
                    We also <strong>highly recommend</strong> you
                    {' '}
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://docs.gorgias.com/email-integrations/email"
                    >
                        setup SPF
                    </a> so your emails are not flagged as Spam when you send them from Gorgias.
                </Alert>
            </div>
        )
    }

    _setName = (name: string) => {
        const {errors} = this.state
        const invalidNameRegexp = new RegExp(`[${EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS.join('')}]`)

        if (name && invalidNameRegexp.test(name)) {
            errors.name = 'The name of your Email integration cannot contain these characters: ' +
                          `${EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS.join(' ')}`
        } else {
            errors.name = null
        }


        this.setState({
            dirty: true,
            name,
            errors
        })
    }

    _updateSignature = (editorState) => {
        const contentState = editorState.getCurrentContent()
        this.setState({
            dirty: true,
            signature_text: contentState.getPlainText(),
            signature_html: convertToHTML(contentState),
        })
    }

    _renderSettings = () => {
        const {
            domain,
            integration,
            loading,
            actions: {
                deleteIntegration
            },
            gmailRedirectUri
        } = this.props

        const isSubmitting = loading.get('updateIntegration') === integration.get('id')
        const isDeactivated = !!integration.get('deactivated_datetime')
        const isDeleting = loading.get('delete') === integration.get('id')
        const isGmail = integration.get('type') === GMAIL_INTEGRATION_TYPE
        const isOutlook = integration.get('type') === OUTLOOK_INTEGRATION_TYPE

        const {
            errors,
            import_spam,
            name,
            use_gmail_categories,
        } = this.state

        const hasErrors = Object.values(errors).some((val) => val != null)

        const nameHelp = 'The name that customers will see when they receive emails from you. ' +
                         `Cannot contain these characters: ${EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS.join(' ')}`

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
                        help={nameHelp}
                        error={errors.name}

                        value={name}
                        onChange={(name) => this._setName(name)}
                    />
                    {
                        isGmail && (
                            <FormGroup>
                                <BooleanField
                                    name="use_gmail_categories"
                                    type="checkbox"
                                    label={
                                        'Tag Gorgias tickets with Gmail categories (Social, Promotions, Updates, ' +
                                        'Forums)'
                                    }
                                    value={use_gmail_categories}
                                    onChange={(value) => this.setState({
                                        dirty: true,
                                        use_gmail_categories: value
                                    })}
                                />
                            </FormGroup>
                        )
                    }
                    <FormGroup>
                        <RichFieldWithVariables
                            allowExternalChanges
                            name="signature"
                            label="Signature"
                            value={{
                                text: integration.getIn(['meta', 'signature', 'text']) || '',
                                html: integration.getIn(['meta', 'signature', 'html']) || '',
                            }}
                            variableTypes={['current_user']}
                            onChange={this._updateSignature}
                        />
                    </FormGroup>
                    {
                        !isOutlook && (
                            <FormGroup>
                                <BooleanField
                                    name="import_spam"
                                    type="checkbox"
                                    label="Import spam emails"
                                    help="Imported spam emails will be placed in the Spam ticket view and will not be
                                    counted in statistics. Spam tickets are automatically deleted after 30 days."
                                    value={import_spam}
                                    onChange={(value) => this.setState({
                                        dirty: true,
                                        import_spam: value
                                    })}
                                />
                            </FormGroup>
                        )
                    }
                    <div>
                        <Button
                            type="submit"
                            color="success"
                            disabled={!this.state.dirty || isSubmitting || isDeleting || hasErrors}
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
                                    href={`${gmailRedirectUri}?integration_id=${integration.get('id')}`}
                                >
                                    Re-activate
                                </Button>
                            )
                        }

                        <ConfirmButton
                            className="float-right"
                            color="secondary"
                            confirm={() => deleteIntegration(integration, 'email')}
                            content="Are you sure you want to delete this integration?"
                        >
                            <i className="material-icons mr-1 text-danger">
                                delete
                            </i>
                            Delete email address
                        </ConfirmButton>
                    </div>
                </Form>
            </div>
        )
    }

    render() {
        const {integration, loading} = this.props

        if (loading.get('integration')) {
            return <Loader/>
        }

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/email">Email</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {integration.get('name')}{' '}
                            <span className="text-faded">
                                {integration.getIn(['meta', 'address'])}
                            </span>
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <Container
                    fluid
                    className="page-container"
                >
                    {integration.get('type') === EMAIL_INTEGRATION_TYPE && this._renderInstructions()}

                    {integration.get('type') === GMAIL_INTEGRATION_TYPE && this._gmailRenderImport()}

                    {integration.get('type') === OUTLOOK_INTEGRATION_TYPE && this._outlookRenderImport()}

                    {this._renderSettings()}
                </Container>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    domain: state.currentAccount.get('domain'),
    gmailRedirectUri: getRedirectUri(GMAIL_INTEGRATION_TYPE)(state),
    forwardingEmailAddress: getForwardingEmailAddress(state),
})

const mapDispatchToProps = {
    importEmails: integrationActions.importEmails
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EmailIntegrationUpdate))
