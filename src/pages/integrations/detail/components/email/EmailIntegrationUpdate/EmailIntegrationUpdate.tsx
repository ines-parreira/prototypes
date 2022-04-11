import React, {Component, FormEvent, ReactNode} from 'react'
import {Link} from 'react-router-dom'
import Clipboard from 'clipboard'
import {connect, ConnectedProps} from 'react-redux'
import _capitalize from 'lodash/capitalize'
import classNames from 'classnames'
import {fromJS, Map} from 'immutable'
import {EditorState} from 'draft-js'
import {
    Container,
    Form,
    Button,
    InputGroup,
    InputGroupAddon,
    Input,
    FormGroup,
} from 'reactstrap'

import {
    GMAIL_IMPORTED_EMAILS_FOR_YEARS,
    OUTLOOK_IMPORTED_EMAILS_FOR_YEARS,
} from 'config'
import {EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS} from 'constants/integration'
import {IntegrationType} from 'models/integration/types'
import Alert from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import CheckBox from 'pages/common/forms/CheckBox'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import RichFieldWithVariables from 'pages/common/forms/RichFieldWithVariables'
import css from 'pages/settings/settings.less'
import {
    deleteIntegration,
    importEmails,
    updateOrCreateIntegration,
} from 'state/integrations/actions'
import {
    getForwardingEmailAddress,
    getRedirectUri,
} from 'state/integrations/selectors'
import {RootState} from 'state/types'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {isGorgiasSupportAddress, displayRestrictedSymbols} from 'utils'
import {convertToHTML} from 'utils/editor'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    isCopied: boolean
    dirty: boolean
    errors: {name?: string | null}
    name: string
    use_gmail_categories: boolean
    enable_gmail_sending: boolean
    signature_text: string
    signature_html: string
}

export class EmailIntegrationUpdateContainer extends Component<Props, State> {
    isInitialized = false

    state: State = {
        isCopied: false,
        dirty: false,
        errors: {},
        name: '',
        use_gmail_categories: false,
        enable_gmail_sending: true,
        signature_text: '',
        signature_html: '',
    }

    constructor(props: Props) {
        super(props)

        this.state = {
            ...this.state,
            ...this._getIntegrationValues(props.integration),
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

    componentDidUpdate() {
        const currentFormValues = this._getFormValues()
        const {integration} = this.props
        const {dirty: dirtyState} = this.state

        const dirty =
            JSON.stringify(integration) !== JSON.stringify(currentFormValues)

        if (dirty !== dirtyState) {
            this.setState({dirty})
        }
    }

    _getIntegrationValues = (integration: Map<any, any>) => {
        return {
            name: integration.get('name', ''),
            enable_gmail_sending:
                integration.get('type') === IntegrationType.Gmail
                    ? integration.getIn(['meta', 'enable_gmail_sending'], true)
                    : true,
            use_gmail_categories:
                integration.get('type') === IntegrationType.Gmail
                    ? integration.getIn(['meta', 'use_gmail_categories']) ||
                      false
                    : false,
        }
    }

    _getFormValues = (): Map<any, any> => {
        const {integration} = this.props
        let form

        form = integration
            .set('name', this.state.name)
            .setIn(['meta', 'signature', 'text'], this.state.signature_text)
            .setIn(['meta', 'signature', 'html'], this.state.signature_html)

        if (integration.get('type') === IntegrationType.Gmail) {
            form = form
                .setIn(
                    ['meta', 'use_gmail_categories'],
                    this.state.use_gmail_categories
                )
                .setIn(
                    ['meta', 'enable_gmail_sending'],
                    this.state.enable_gmail_sending
                )
        }

        return form
    }

    _clipboardCopy = (button: HTMLButtonElement) => {
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

    _handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        const {updateOrCreateIntegration} = this.props

        return (
            updateOrCreateIntegration(this._getFormValues()) as Promise<void>
        ).then(() => {
            this.setState({dirty: false})
        })
    }

    _gmailImportEmails = () => {
        const {integration, importEmails} = this.props

        return importEmails(
            fromJS({
                id: integration.get('id'),
                meta: {
                    import_activated: true,
                },
            })
        )
    }

    _outlookImportEmails = () => {
        const {integration, importEmails} = this.props

        return importEmails(
            fromJS({
                id: integration.get('id'),
                meta: (integration.get('meta') as Map<any, any>).setIn(
                    ['import_state', 'enabled'],
                    true
                ),
            })
        )
    }

    _renderImport = (
        importActivated: boolean,
        status: string,
        mailsImported: boolean,
        importDescription: ReactNode,
        importMethod: () => Promise<unknown>
    ) => {
        const {integration, loading} = this.props
        const email = integration.getIn(['meta', 'address'], '')

        const isLoading = loading.get('import') === integration.get('id')
        const isImporting = status === 'started' || (importActivated && !status)

        const statusSentence = isImporting ? (
            <span>
                We are currently importing emails from <strong>{email}</strong>{' '}
                into Gorgias. You can see it's progress here:{' '}
                <Link to="/app/tickets">All tickets</Link>
            </span>
        ) : (
            <span>
                Completed: <b>{mailsImported}</b> emails have been imported.
            </span>
        )

        return (
            <div>
                <h2>
                    {isImporting && (
                        <i className="material-icons md-spin mr-2">autorenew</i>
                    )}
                    Import
                </h2>
                <p>
                    {importActivated ? (
                        statusSentence
                    ) : (
                        <span>
                            We will import {importDescription} from{' '}
                            <b>{email}</b> into Gorgias <b>as closed tickets</b>
                            .
                        </span>
                    )}
                </p>
                {!importActivated && (
                    <ConfirmButton
                        isLoading={isLoading}
                        onConfirm={importMethod}
                        confirmationContent="Are you sure you want to import emails?"
                    >
                        Import emails
                    </ConfirmButton>
                )}
            </div>
        )
    }

    _gmailRenderImport = () => {
        const {integration} = this.props
        const importActivated = integration.getIn(
            ['meta', 'import_activated'],
            false
        )
        const status = integration.getIn(
            ['meta', 'importation', 'status'],
            false
        )
        const mailsImported = integration.getIn(
            ['meta', 'importation', 'count'],
            0
        )
        const importDescription = (
            <span>
                the last <b>{GMAIL_IMPORTED_EMAILS_FOR_YEARS}</b> years of
                emails
            </span>
        )
        return this._renderImport(
            importActivated,
            status,
            mailsImported,
            importDescription,
            this._gmailImportEmails
        )
    }

    _outlookRenderImport = () => {
        const {integration} = this.props
        const importActivated = integration.getIn(
            ['meta', 'import_state', 'enabled'],
            false
        )
        const status = integration.getIn(
            ['meta', 'import_state', 'is_over'],
            false
        )
        const mailsImported = integration.getIn(
            ['meta', 'import_state', 'count'],
            0
        )
        const importDescription = (
            <span>
                the last <b>{OUTLOOK_IMPORTED_EMAILS_FOR_YEARS}</b> years of
                emails
            </span>
        )
        return this._renderImport(
            importActivated,
            status,
            mailsImported,
            importDescription,
            this._outlookImportEmails
        )
    }

    _renderInstructions = () => {
        const {forwardingEmailAddress, integration} = this.props
        const address = integration.getIn(['meta', 'address'], '')

        if (isGorgiasSupportAddress(address)) {
            // no need to display instructions for our own support address
            return (
                <Alert>
                    Emails sent to <b>{address}</b> will arrive in the helpdesk,
                    but we recommend using your own company support address.
                </Alert>
            )
        }

        return (
            <div>
                <h3>Setup instructions</h3>
                <p>
                    Forward emails from <b>{address}</b> to the address below.
                    Need help? Follow our{' '}
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://docs.gorgias.com/email-integrations/spf-dkim-support"
                        onClick={() => {
                            logEvent(SegmentEvent.ExternalLinkClicked, {
                                name: 'Step by step instructions in add email integration',
                                url: 'https://docs.gorgias.com/email-integrations/spf-dkim-support',
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
                            <i className="material-icons mr-2">file_copy</i>
                            {this.state.isCopied ? 'Copied!' : 'Copy'}
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
                <br />
                <Alert>
                    We also <strong>highly recommend</strong> you{' '}
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://docs.gorgias.com/email-integrations/spf-dkim-support"
                    >
                        setup SPF
                    </a>{' '}
                    so your emails are not flagged as Spam when you send them
                    from Gorgias.
                </Alert>
            </div>
        )
    }

    _setName = (name: string) => {
        const {errors} = this.state
        const invalidNameRegexp = new RegExp(
            `[${EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS.join('')}]`
        )

        if (name && invalidNameRegexp.test(name)) {
            errors.name =
                'The name of your Email integration cannot contain these characters: ' +
                displayRestrictedSymbols(
                    EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS as string[]
                )
        } else {
            errors.name = null
        }

        this.setState({
            name,
            errors,
        })
    }

    _updateSignature = (editorState: EditorState) => {
        const contentState = editorState.getCurrentContent()
        this.setState({
            signature_text: contentState.getPlainText(),
            signature_html: convertToHTML(contentState),
        })
    }

    _renderSettings = () => {
        const {
            domain,
            integration,
            loading,
            deleteIntegration,
            gmailRedirectUri,
        } = this.props

        const isSubmitting =
            loading.get('updateIntegration') === integration.get('id')
        const isDeactivated = !!integration.get('deactivated_datetime')
        const isDeleting = loading.get('delete') === integration.get('id')
        const isGmail = integration.get('type') === IntegrationType.Gmail

        const {errors, name, use_gmail_categories, enable_gmail_sending} =
            this.state

        const hasErrors = Object.values(errors).some((val) => val != null)

        const nameHelp =
            'The name that customers will see when they receive emails from you. ' +
            `Cannot contain these characters: ${displayRestrictedSymbols(
                EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS as string[]
            )}`

        const enableGmailSendingHelp = (
            <div>
                Disable this option if you face connectivity issues with your
                Gmail integration, or if Gmail keeps identifying your inbox as
                spam. If you disable this option, we will send those emails
                directly instead of going through Gmail. In order to keep a good
                deliverability in this case, you will need to{' '}
                <a
                    href="https://docs.gorgias.com/email-integrations/spf-dkim-support"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    setup SPF
                </a>
                . Also, if you disable this option, your emails will not be
                synchronized in the Sent folder of your Gmail inbox anymore.
            </div>
        )

        return (
            <div className="mt-4">
                <h3>Settings</h3>
                <Form onSubmit={this._handleSubmit}>
                    <DEPRECATED_InputField
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
                    {isGmail && (
                        <FormGroup>
                            <CheckBox
                                name="use_gmail_categories"
                                isChecked={use_gmail_categories}
                                onChange={(value: boolean) =>
                                    this.setState({
                                        use_gmail_categories: value,
                                    })
                                }
                            >
                                Tag Gorgias tickets with Gmail categories
                                (Social, Promotions, Updates, Forums)
                            </CheckBox>
                        </FormGroup>
                    )}
                    <FormGroup>
                        <RichFieldWithVariables
                            allowExternalChanges
                            label="Signature"
                            value={{
                                text:
                                    integration.getIn([
                                        'meta',
                                        'signature',
                                        'text',
                                    ]) || '',
                                html:
                                    integration.getIn([
                                        'meta',
                                        'signature',
                                        'html',
                                    ]) || '',
                            }}
                            variableTypes={['current_user']}
                            onChange={this._updateSignature}
                        />
                    </FormGroup>
                    {isGmail && (
                        <FormGroup>
                            <CheckBox
                                name="enable_gmail_sending"
                                caption={enableGmailSendingHelp}
                                isChecked={enable_gmail_sending}
                                onChange={(value: boolean) =>
                                    this.setState({
                                        enable_gmail_sending: value,
                                    })
                                }
                            >
                                Enable sending emails with Gmail
                            </CheckBox>
                        </FormGroup>
                    )}
                    <div>
                        <Button
                            type="submit"
                            color="success"
                            disabled={
                                !this.state.dirty ||
                                isSubmitting ||
                                isDeleting ||
                                hasErrors
                            }
                            className={classNames({
                                'btn-loading': isSubmitting,
                            })}
                        >
                            Save changes
                        </Button>
                        {isDeactivated && isGmail && (
                            <Button
                                className="ml-2"
                                tag="a"
                                color="success"
                                href={`${gmailRedirectUri}?integration_id=${
                                    integration.get('id') as number
                                }`}
                            >
                                Re-activate
                            </Button>
                        )}

                        <ConfirmButton
                            className="float-right"
                            onConfirm={() => deleteIntegration(integration)}
                            confirmationContent="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                            intent="destructive"
                        >
                            <ButtonIconLabel icon="delete">
                                Delete email address
                            </ButtonIconLabel>
                        </ConfirmButton>
                    </div>
                </Form>
            </div>
        )
    }

    render() {
        const {integration, loading} = this.props

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <Container fluid className={css.pageContainer}>
                {integration.get('type') === IntegrationType.Email &&
                    this._renderInstructions()}

                {integration.get('type') === IntegrationType.Gmail &&
                    this._gmailRenderImport()}

                {integration.get('type') === IntegrationType.Outlook &&
                    this._outlookRenderImport()}

                {this._renderSettings()}
            </Container>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        domain: state.currentAccount.get('domain'),
        gmailRedirectUri: getRedirectUri(IntegrationType.Gmail)(state),
        forwardingEmailAddress: getForwardingEmailAddress(state),
    }),
    {
        importEmails,
        updateOrCreateIntegration,
        deleteIntegration,
    }
)

export default connector(EmailIntegrationUpdateContainer)
