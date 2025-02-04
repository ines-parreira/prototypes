import {Tooltip} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import copy from 'copy-to-clipboard'
import {EditorState} from 'draft-js'
import {fromJS, Map} from 'immutable'
import {LDFlagSet, withLDConsumer} from 'launchdarkly-react-client-sdk'
import {isEqual} from 'lodash'
import _capitalize from 'lodash/capitalize'
import React, {Component, FormEvent, ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import {
    Col,
    Container,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
} from 'reactstrap'

import {logEvent, SegmentEvent} from 'common/segment'
import {UploadType} from 'common/types'
import {
    GMAIL_IMPORTED_EMAILS_FOR_YEARS,
    OUTLOOK_IMPORTED_EMAILS_FOR_YEARS,
} from 'config'
import {EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS} from 'constants/integration'
import {EmailIntegrationDefaultProviderSetting} from 'models/integration/constants'
import {IntegrationType} from 'models/integration/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'
import InputField from 'pages/common/forms/input/InputField'
import RichFieldWithVariables from 'pages/common/forms/RichFieldWithVariables'
import ToggleInput from 'pages/common/forms/ToggleInput'
import EmailIntegrationAddressField from 'pages/integrations/integration/components/email/EmailIntegrationUpdate/EmailIntegrationAddressField'
import EmailIntegrationDeliverabilitySettings from 'pages/integrations/integration/components/email/EmailIntegrationUpdate/EmailIntegrationDeliverabilitySettings'
import css from 'pages/integrations/integration/components/email/EmailIntegrationUpdate/EmailIntegrationUpdate.less'
import EmailIntegrationConnectStore from 'pages/integrations/integration/components/email/EmailToStoreMapping/EmailIntegrationConnectStore'
import {
    getOutboundEmailProviderSettingKey,
    isBaseEmailAddress,
} from 'pages/integrations/integration/components/email/helpers'
import {INTEGRATION_REMOVAL_CONFIGURATION_TEXT} from 'pages/integrations/integration/constants'
import settingsCss from 'pages/settings/settings.less'
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
import {displayRestrictedSymbols} from 'utils'
import {convertToHTML} from 'utils/editor'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    flags?: LDFlagSet
} & ConnectedProps<typeof connector>

type State = {
    isCopied: boolean
    dirty: boolean
    errors: {name?: string | null}
    name: string
    use_gmail_categories: boolean
    enable_gmail_sending: boolean
    enable_outlook_sending: boolean
    enable_gmail_threading: boolean
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
        enable_outlook_sending: true,
        enable_gmail_threading: true,
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

    UNSAFE_componentWillUpdate(nextProps: Props) {
        const {integration, loading} = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && !loading.get('integration')) {
            this.setState(this._getIntegrationValues(integration))
            this.isInitialized = true
        }
    }

    componentDidUpdate() {
        const {integration} = this.props
        const integrationHasSignature = integration.getIn(['meta', 'signature'])
        const currentFormValues = this._getFormValues(!integrationHasSignature)
        const {dirty: dirtyState} = this.state

        const dirty = !isEqual(integration.toJS(), currentFormValues.toJS())

        if (dirty !== dirtyState) {
            this.setState({dirty})
        }
    }

    _getIntegrationValues = (integration: Map<any, any>) => {
        return {
            name: integration.get('name', ''),
            enable_outlook_sending:
                integration.get('type') === IntegrationType.Outlook &&
                integration.getIn(
                    [
                        'meta',
                        EmailIntegrationDefaultProviderSetting.SendViaOutlook,
                    ],
                    true
                ),
            enable_gmail_sending:
                integration.get('type') === IntegrationType.Gmail
                    ? integration.getIn(['meta', 'enable_gmail_sending'], true)
                    : true,
            enable_gmail_threading:
                integration.get('type') === IntegrationType.Gmail
                    ? integration.getIn(
                          ['meta', 'enable_gmail_threading'],
                          true
                      )
                    : true,
            use_gmail_categories:
                integration.get('type') === IntegrationType.Gmail
                    ? integration.getIn(['meta', 'use_gmail_categories']) ||
                      false
                    : false,
        }
    }

    _getFormValues = (removeSignatureWhenEmpty?: boolean): Map<any, any> => {
        const {integration} = this.props
        let form

        form = integration
            .set('name', this.state.name)
            .setIn(['meta', 'signature', 'text'], this.state.signature_text)
            .setIn(['meta', 'signature', 'html'], this.state.signature_html)

        /**
         * when the integration object doesn't have the "signature" key,
         * the form values object will always be different from the integration
         * object because the initial state of the form contains the "signature"
         * property
         * in this case, if the text value of the signature is also empty,
         * remove the property from the form values before comparing the
         * form values with the integration values
         */
        if (!this.state.signature_text && removeSignatureWhenEmpty) {
            form = form.removeIn(['meta', 'signature'])
        }

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
                .setIn(
                    ['meta', 'enable_gmail_threading'],
                    this.state.enable_gmail_threading
                )
        } else if (integration.get('type') === IntegrationType.Outlook) {
            form = form.setIn(
                ['meta', EmailIntegrationDefaultProviderSetting.SendViaOutlook],
                this.state.enable_outlook_sending
            )
        }

        return form
    }

    _clipboardCopy = (text: string) => {
        copy(text)
        this.setState({isCopied: true})
        setTimeout(() => {
            this.setState({isCopied: false})
        }, 1500)
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
                into Gorgias. You can see its progress here:{' '}
                <Link to="/app/tickets">All tickets</Link>
            </span>
        ) : (
            <Alert type={AlertType.Success} icon className="mt-3">
                Completed: <b>{mailsImported}</b> emails have been imported.
            </Alert>
        )

        return (
            <div className={css.importSection}>
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
                            Import {importDescription} from <b>{email}</b> as
                            closed tickets.
                        </span>
                    )}
                </p>
                {!importActivated && (
                    <ConfirmButton
                        isLoading={isLoading}
                        onConfirm={importMethod}
                        confirmationContent="Are you sure you want to import emails?"
                        intent="secondary"
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
        const address: string = integration.getIn(['meta', 'address'], '')

        if (isBaseEmailAddress(address)) {
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
                            intent="primary"
                            data-clipboard-target="#forwarding-email"
                            onClick={() =>
                                this._clipboardCopy(forwardingEmailAddress)
                            }
                        >
                            <i className="material-icons mr-2">file_copy</i>
                            {this.state.isCopied ? 'Copied!' : 'Copy'}
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
                <br />
                <Alert>
                    Starting February 1st 2024,{' '}
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://docs.gorgias.com/email-integrations/spf-dkim-support"
                    >
                        Domain Verification
                    </a>{' '}
                    is <b>mandatory</b>, to <b>avoid deliverability issues</b>{' '}
                    when you send emails from Gorgias.
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
        const isOutlook = integration.get('type') === IntegrationType.Outlook
        const {errors, name, use_gmail_categories, enable_gmail_threading} =
            this.state

        const hasErrors = Object.values(errors).some((val) => val != null)

        const nameHelp = `The display name appears on outgoing emails. It cannot contain the following characters: ${displayRestrictedSymbols(
            EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS as string[]
        )}`
        const outlookDisplayNameLimitationTooltip = (
            <>
                <i
                    className="material-icons"
                    id="outlook-display-name-limitation-info-icon"
                >
                    info_outline
                </i>
                <Tooltip
                    target="outlook-display-name-limitation-info-icon"
                    autohide={false}
                >
                    Display name can only be changed through{' '}
                    <a
                        href={
                            'https://learn.microsoft.com/en-us/microsoft-365/admin/add-users/' +
                            'change-a-user-name-and-email-address?view=o365-worldwide' +
                            '#watch-change-a-users-email-address-display-name-or-email-alias'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Outlook
                    </a>
                </Tooltip>
            </>
        )

        return (
            <div className="mt-4">
                <EmailIntegrationConnectStore
                    integration={this.props.integration}
                />
                <h3>Settings</h3>
                <Form onSubmit={this._handleSubmit}>
                    <EmailIntegrationAddressField
                        integration={this.props.integration.toJS()}
                    />
                    <InputField
                        type="text"
                        name="name"
                        label={
                            <div>
                                Display name {''}
                                {isOutlook &&
                                    outlookDisplayNameLimitationTooltip}
                            </div>
                        }
                        placeholder={`${_capitalize(domain)} Support`}
                        isRequired={!isOutlook}
                        caption={nameHelp}
                        error={errors.name ?? ''}
                        value={name}
                        onChange={(name) => this._setName(name)}
                        isDisabled={isOutlook}
                    />
                    <FormGroup className={css.textEditor}>
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
                            uploadType={UploadType.PublicAttachment}
                        />
                    </FormGroup>
                    {isGmail && (
                        <FormGroup className={css.gmailTogglesWrapper}>
                            <ToggleInput
                                name="use_gmail_categories"
                                isToggled={use_gmail_categories}
                                onClick={(value: boolean) =>
                                    this.setState({
                                        use_gmail_categories: value,
                                    })
                                }
                                caption="Categories include Social, Promotions, Updates, and Forums"
                            >
                                Tag tickets with Gmail categories
                            </ToggleInput>
                            <ToggleInput
                                isToggled={enable_gmail_threading}
                                onClick={(value: boolean) =>
                                    this.setState({
                                        enable_gmail_threading: value,
                                    })
                                }
                                caption="Group emails if they have the same recipients, sender, or subject. "
                                name="enable_gmail_threading"
                            >
                                Group emails into conversations
                            </ToggleInput>
                        </FormGroup>
                    )}
                    {(isGmail || isOutlook) && (
                        <FormGroup className={css.emailDeliverabilitySettings}>
                            <EmailIntegrationDeliverabilitySettings
                                integration={integration.toJS()}
                                onChange={(newValue: boolean) =>
                                    this.setState({
                                        ...this.state,
                                        [getOutboundEmailProviderSettingKey(
                                            integration.get('type')
                                        )]: newValue,
                                    })
                                }
                            ></EmailIntegrationDeliverabilitySettings>
                        </FormGroup>
                    )}
                    <div className={css.buttonsWrapper}>
                        <Button
                            type="submit"
                            intent="primary"
                            isDisabled={
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
                                color="success"
                                onClick={(e) => {
                                    e.preventDefault()
                                    const url = `${gmailRedirectUri}?integration_id=${
                                        integration.get('id') as number
                                    }`
                                    window.open(url)
                                }}
                            >
                                Re-activate
                            </Button>
                        )}

                        <ConfirmButton
                            className="float-right"
                            onConfirm={() => deleteIntegration(integration)}
                            confirmationContent={
                                INTEGRATION_REMOVAL_CONFIGURATION_TEXT
                            }
                            intent="destructive"
                            fillStyle="ghost"
                            leadingIcon="delete"
                        >
                            Delete Integration
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
            <Container fluid className={settingsCss.pageContainer}>
                <Col lg={6} xl={7}>
                    {integration.get('type') === IntegrationType.Email &&
                        this._renderInstructions()}

                    {integration.get('type') === IntegrationType.Gmail &&
                        this._gmailRenderImport()}

                    {integration.get('type') === IntegrationType.Outlook &&
                        this._outlookRenderImport()}

                    {this._renderSettings()}
                </Col>
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

export default connector(withLDConsumer()(EmailIntegrationUpdateContainer))
