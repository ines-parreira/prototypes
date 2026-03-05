import type { ComponentProps, SyntheticEvent } from 'react'
import { Component } from 'react'
import type React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { fromJS } from 'immutable'
import { isArray } from 'lodash'
import _forIn from 'lodash/forIn'
import _isEmpty from 'lodash/isEmpty'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Container, Form, FormGroup, FormText } from 'reactstrap'

import {
    Box,
    Button,
    LegacyLabel as Label,
    ListItem,
    Select,
    SelectTrigger,
    TextField,
    ToggleField,
} from '@gorgias/axiom'

import { ContentType, HttpMethod } from 'models/api/types'
import { EventType } from 'models/event/types'
import type {
    HTTPForm,
    HttpIntegration,
    HttpIntegrationMeta,
    OAuth2Config,
} from 'models/integration/types'
import { IntegrationType, OAuth2TokenLocation } from 'models/integration/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'
import CheckBox from 'pages/common/forms/CheckBox'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import { DEFAULT_FORM } from 'pages/integrations/integration/components/http/Integration/constants'
import { validateHeaderName } from 'pages/integrations/integration/components/http/Integration/httpHeaderValidation'
import JSONBody from 'pages/integrations/integration/components/http/Integration/JSONBody'
import type { Field } from 'pages/integrations/integration/components/http/Integration/ObjectListField'
import ObjectListField from 'pages/integrations/integration/components/http/Integration/ObjectListField'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'
import css from 'pages/settings/settings.less'
import InfoIconWithTooltip from 'pages/tickets/common/components/InfoIconWithTooltip'
import {
    activateIntegration,
    deactivateIntegration,
    deleteIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'
import { getIntegrationsLoading } from 'state/integrations/selectors'
import type { RootState } from 'state/types'
import { validateWebhookURL, validateWebhookURLToPattern } from 'utils'

type Props = {
    integration: HttpIntegration | undefined
    isUpdate: boolean
    isHttpIntegrationOAuthEnabled?: boolean
} & ConnectedProps<typeof connector>

type State = {
    description: string
    form?: HTTPForm | null
    headers: Field[]
    isTestShown: boolean
    method?: HttpMethod
    name: string
    oauth2Enabled: boolean
    oauth2Config: OAuth2Config
    requestContentType?: ContentType
    responseContentType?: ContentType
    ticketCreated: boolean
    ticketMessageCreated: boolean
    ticketUpdated: boolean
    ticketSelfUnsnoozed: boolean
    ticketMessageFailed: boolean
    ticketAssignmentUpdated?: boolean
    ticketStatusUpdated?: boolean
    url: string
}

export class Integration extends Component<Props, State> {
    state: State = {
        isTestShown: false,
        name: '',
        description: '',
        url: '',
        method: HttpMethod.Get,
        requestContentType: ContentType.Json,
        responseContentType: ContentType.Json,
        ticketCreated: false,
        ticketUpdated: false,
        ticketSelfUnsnoozed: false,
        ticketMessageCreated: false,
        ticketMessageFailed: false,
        ticketAssignmentUpdated: false,
        ticketStatusUpdated: false,
        headers: [],
        form: null,
        oauth2Enabled: false,
        oauth2Config: {
            token_url: '',
            client_id: '',
            client_secret: '',
            token_location: OAuth2TokenLocation.Header,
            token_key: '',
            scopes: '',
        },
    }

    isInitialized: boolean | undefined

    UNSAFE_componentWillMount() {
        const { integration, isUpdate } = this.props

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && integration) {
            this.setState(this._mapIntegrationToState(integration))
            this.isInitialized = true
        }
    }

    UNSAFE_componentWillUpdate(nextProps: Props) {
        const { integration, isUpdate } = nextProps

        // populating the form when updating an integration
        if (integration && !this.isInitialized && isUpdate) {
            this.setState(this._mapIntegrationToState(integration))
            this.isInitialized = true
        }
    }

    _mapIntegrationToState = (integration: HttpIntegration) => {
        const isJsonBody =
            integration.http?.request_content_type === ContentType.Json
        let formData = integration.http?.form
        if (
            !isJsonBody &&
            formData &&
            typeof formData === 'object' &&
            !isArray(formData)
        ) {
            formData = this._objectToParameters(formData)
        }
        const headers = integration.http?.headers

        const existingOAuth2 = integration.http?.oauth2

        return {
            name: integration.name,
            description: integration.description || '',
            headers: this._objectToParameters(headers || {}),
            url: integration.http?.url || '',
            method: integration.http?.method,
            requestContentType: integration.http?.request_content_type,
            responseContentType: integration.http?.response_content_type,
            ticketCreated:
                integration.http?.triggers['ticket-created'] ?? false,
            ticketUpdated:
                integration.http?.triggers['ticket-updated'] ?? false,
            ticketSelfUnsnoozed:
                integration.http?.triggers['ticket-self-unsnoozed'] ?? false,
            ticketMessageCreated:
                integration.http?.triggers['ticket-message-created'] ?? false,
            ticketMessageFailed:
                integration.http?.triggers['ticket-message-failed'] ?? false,
            ticketAssignmentUpdated:
                integration.http?.triggers['ticket-assignment-updated'] ??
                false,
            ticketStatusUpdated:
                integration.http?.triggers['ticket-status-updated'] ?? false,
            form: formData,
            oauth2Enabled: !!existingOAuth2,
            oauth2Config: existingOAuth2 ?? {
                token_url: '',
                client_id: '',
                client_secret: '',
                token_location: OAuth2TokenLocation.Header,
                token_key: '',
                scopes: '',
            },
        }
    }

    _isSubmitting = () => {
        const { loading, integration } = this.props
        if (!loading || !integration) return false
        return loading.updateIntegration === integration.id
    }

    _isDisabled = () => {
        return (
            !this.state.name ||
            !this.state.url ||
            (!this.state.ticketCreated &&
                !this.state.ticketUpdated &&
                !this.state.ticketSelfUnsnoozed &&
                !this.state.ticketMessageCreated &&
                !this.state.ticketMessageFailed &&
                !this.state.ticketAssignmentUpdated &&
                !this.state.ticketStatusUpdated)
        )
    }

    _onRequestContentTypeChange(value: string) {
        const form = this.state.form as HTTPForm | null

        if (value === ContentType.Json) {
            this.setState({
                form:
                    form instanceof Array
                        ? this._parametersToObject(form)
                        : form,
                requestContentType: ContentType.Json,
            })
        } else {
            this.setState({
                form:
                    form instanceof Object
                        ? this._objectToParameters(
                              form as Record<string, unknown>,
                          )
                        : form,
                requestContentType: ContentType.Form,
            })
        }
    }

    /**
     * Transform an object like {key1: value1} into parameter format {key: key1, value: value1}
     */
    _objectToParameters(object: Record<string, unknown> = {}) {
        const obj = object || {}
        const params: Array<Record<string, unknown>> = []
        _forIn(obj, (value, key) => {
            params.push({
                key,
                value,
            })
        })
        return params as Field[]
    }

    /**
     * Transform a parameter format like {key: key1, value: value1} into object {key1: value1}
     */
    _parametersToObject(params: Array<{ key: string; value: unknown }> = []) {
        if (!params) {
            return {}
        }
        return params.reduce((reduction: { [key: string]: unknown }, param) => {
            const newReduction = reduction
            newReduction[param.key] = param.value
            return newReduction
        }, {})
    }

    _handleSubmit = (evt: SyntheticEvent<HTMLFormElement>) => {
        evt.preventDefault()

        let form = this.state.form as HTTPForm | null

        if (this.state.requestContentType !== ContentType.Json) {
            form = form instanceof Array ? this._parametersToObject(form) : form
        }

        const integration: Partial<
            Omit<HttpIntegration, 'http'> & {
                http: Partial<HttpIntegrationMeta>
            }
        > = {
            type: IntegrationType.Http,
            name: this.state.name,
            description: this.state.description,
            http: {
                // transforming headers into objects
                headers: this._parametersToObject(this.state.headers),
                url: this.state.url,
                method: this.state.method,
                request_content_type: this.state.requestContentType,
                response_content_type: this.state.responseContentType,
                triggers: {
                    [EventType.TicketCreated]: this.state.ticketCreated,
                    [EventType.TicketUpdated]: this.state.ticketUpdated,
                    [EventType.TicketSelfUnsnoozed]:
                        this.state.ticketSelfUnsnoozed,
                    [EventType.TicketMessageCreated]:
                        this.state.ticketMessageCreated,
                    [EventType.TicketMessageFailed]:
                        this.state.ticketMessageFailed,
                    [EventType.TicketAssignmentUpdated]:
                        this.state.ticketAssignmentUpdated,
                    [EventType.TicketStatusUpdated]:
                        this.state.ticketStatusUpdated,
                },
                form,
                oauth2: this.state.oauth2Enabled
                    ? this.state.oauth2Config
                    : undefined,
            },
        }

        // if update, set ids for server
        if (this.props.isUpdate) {
            integration.id = this.props.integration!.id
            if (integration.http && this.props.integration?.http?.id) {
                integration.http.id = this.props.integration?.http?.id
            }
        }

        return this.props.updateOrCreateIntegration(fromJS(integration))
    }

    _validateHeaderName = (
        inputType: string,
        value: string,
    ): string | undefined => {
        /*
            Method is passed as a 'validate' function to all key and value fields of the ObjectListField class.
            Because we only want to validate the header name (key) fields, we have to check if the inputType is 'key'.
            inputType: string: ['key', 'value']
        */

        if (inputType === 'key' && value && !validateHeaderName(value)) {
            return 'Header name contains invalid characters'
        }
    }

    _setMethod = (newMethod: string) => {
        const { isUpdate, integration } = this.props
        const { method, form } = this.state

        const stateUpdate: Record<string, unknown> = { method: newMethod }

        const savedMethodIsGet = integration?.http?.method === HttpMethod.Get
        const isSwitchingFromGetToOther =
            method === HttpMethod.Get && newMethod !== HttpMethod.Get
        const formIsEmpty = !form || _isEmpty(form)

        if (
            (!isUpdate || savedMethodIsGet) &&
            isSwitchingFromGetToOther &&
            formIsEmpty
        ) {
            stateUpdate.form = DEFAULT_FORM
        }

        this.setState(stateUpdate as State)
    }

    render() {
        const {
            integration,
            isUpdate,
            activateIntegration,
            deactivateIntegration,
            deleteIntegration,
        } = this.props
        const {
            method,
            name,
            description,
            url,
            requestContentType,
            responseContentType,
            headers,
            ticketCreated,
            ticketUpdated,
            ticketSelfUnsnoozed,
            ticketMessageCreated,
            ticketMessageFailed,
            ticketAssignmentUpdated,
            ticketStatusUpdated,
            form,
            oauth2Enabled,
            oauth2Config,
        } = this.state

        const { isHttpIntegrationOAuthEnabled } = this.props

        const isSubmitting = this._isSubmitting()

        const isDisabled = this._isDisabled()

        const isActive = !integration?.deactivated_datetime

        const isIncomplete = isUpdate && !integration?.http

        const isOldTriggerSelected =
            ticketCreated ||
            ticketUpdated ||
            ticketSelfUnsnoozed ||
            ticketMessageCreated ||
            ticketMessageFailed

        if (isUpdate && !integration) {
            return <Loader />
        }

        return (
            <div className="full-width">
                <Container fluid className={css.pageContainer}>
                    {isIncomplete ? (
                        <Alert type={AlertType.Warning} icon className="mb-4">
                            The settings for this HTTP integration are
                            incomplete and it might not be working as expected.
                            Edition mode has been disabled.
                        </Alert>
                    ) : (
                        <p>
                            Add the details about the HTTP integration you want
                            to add below. If you need help, you can check our{' '}
                            <a
                                href="https://docs.gorgias.com/data-and-http-integrations/http-integrations"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                docs
                            </a>{' '}
                            or contact us.
                        </p>
                    )}
                    <Form onSubmit={this._handleSubmit}>
                        <DEPRECATED_InputField
                            type="text"
                            name="name"
                            label="Integration name"
                            value={name}
                            onChange={(value) => this.setState({ name: value })}
                            required
                            disabled={isIncomplete}
                        />
                        <DEPRECATED_InputField
                            type="text"
                            name="description"
                            label="Description"
                            value={description}
                            onChange={(value) =>
                                this.setState({ description: value })
                            }
                            disabled={isIncomplete}
                        />
                        {!isIncomplete && (
                            <>
                                <FormGroup>
                                    <Label className="control-label">
                                        Triggers
                                    </Label>
                                    <p>
                                        <FormText color="muted">
                                            This HTTP integration will be
                                            executed when any of the events
                                            below happens.
                                        </FormText>
                                    </p>
                                    <CheckBox
                                        isDisabled={
                                            ticketAssignmentUpdated ||
                                            ticketStatusUpdated
                                        }
                                        className="mb-2"
                                        name="http.triggers.ticket-created"
                                        isChecked={ticketCreated}
                                        onChange={(value: boolean) =>
                                            this.setState({
                                                ticketCreated: value,
                                            })
                                        }
                                    >
                                        Ticket created
                                    </CheckBox>
                                    <CheckBox
                                        isDisabled={
                                            ticketAssignmentUpdated ||
                                            ticketStatusUpdated
                                        }
                                        className="mb-2"
                                        name="http.triggers.ticket-updated"
                                        isChecked={ticketUpdated}
                                        onChange={(value: boolean) =>
                                            this.setState({
                                                ticketUpdated: value,
                                            })
                                        }
                                    >
                                        Ticket updated
                                    </CheckBox>

                                    <CheckBox
                                        isDisabled={isOldTriggerSelected}
                                        className="mb-2"
                                        name="http.triggers.ticket-assignment-updated"
                                        isChecked={ticketAssignmentUpdated}
                                        onChange={(value: boolean) =>
                                            this.setState({
                                                ticketAssignmentUpdated: value,
                                            })
                                        }
                                    >
                                        Ticket assignment updated
                                        <InfoIconWithTooltip
                                            id="tooltip-ticket-assignment-updated"
                                            tooltipProps={{
                                                autohide: true,
                                                placement: 'bottom',
                                            }}
                                        >
                                            <>
                                                This trigger and the
                                                &apos;Ticket created, Ticket
                                                updated, Ticket self unsnoozed,
                                                Ticket message created and
                                                Ticket message failed &apos;
                                                triggers are mutually exclusive.
                                                Selecting this trigger results
                                                in a shorter payload.
                                            </>
                                        </InfoIconWithTooltip>
                                    </CheckBox>
                                    <CheckBox
                                        isDisabled={isOldTriggerSelected}
                                        className="mb-2"
                                        name="http.triggers.ticket-status-updated"
                                        isChecked={ticketStatusUpdated}
                                        onChange={(value: boolean) =>
                                            this.setState({
                                                ticketStatusUpdated: value,
                                            })
                                        }
                                    >
                                        Ticket status updated
                                        <InfoIconWithTooltip
                                            id="tooltip-ticket-status-updated"
                                            tooltipProps={{
                                                autohide: true,
                                                placement: 'bottom',
                                            }}
                                        >
                                            <>
                                                This trigger and the
                                                &apos;Ticket created, Ticket
                                                updated, Ticket self unsnoozed,
                                                Ticket message created and
                                                Ticket message failed &apos;
                                                triggers are mutually exclusive.
                                                Selecting this trigger results
                                                in a shorter payload.
                                            </>
                                        </InfoIconWithTooltip>
                                    </CheckBox>
                                    <CheckBox
                                        isDisabled={
                                            ticketAssignmentUpdated ||
                                            ticketStatusUpdated
                                        }
                                        className="mb-2"
                                        name="http.triggers.ticket-self-unsnoozed"
                                        isChecked={ticketSelfUnsnoozed}
                                        onChange={(value: boolean) =>
                                            this.setState({
                                                ticketSelfUnsnoozed: value,
                                            })
                                        }
                                    >
                                        Ticket self unsnoozed
                                    </CheckBox>
                                    <CheckBox
                                        isDisabled={
                                            ticketAssignmentUpdated ||
                                            ticketStatusUpdated
                                        }
                                        className="mb-2"
                                        name="http.triggers.ticket-message-created"
                                        isChecked={ticketMessageCreated}
                                        onChange={(value: boolean) =>
                                            this.setState({
                                                ticketMessageCreated: value,
                                            })
                                        }
                                    >
                                        Ticket message created
                                    </CheckBox>
                                    <CheckBox
                                        isDisabled={
                                            ticketAssignmentUpdated ||
                                            ticketStatusUpdated
                                        }
                                        className="mb-2"
                                        name="http.triggers.ticket-message-failed"
                                        isChecked={ticketMessageFailed}
                                        onChange={(value: boolean) =>
                                            this.setState({
                                                ticketMessageFailed: value,
                                            })
                                        }
                                    >
                                        Ticket message failed
                                    </CheckBox>
                                </FormGroup>
                                <DEPRECATED_InputField
                                    type="url"
                                    error={validateWebhookURL(url, true)}
                                    name="http.url"
                                    label="URL"
                                    title="Example: https://company.com/api"
                                    placeholder="https://company.com/api/customers?customer_id={{ticket.customer_id}}"
                                    required
                                    pattern={validateWebhookURLToPattern(
                                        url,
                                        true,
                                    )}
                                    help={
                                        <div>
                                            You can use{' '}
                                            <code>
                                                {'{{ticket.customer_id}}'}
                                            </code>{' '}
                                            to pass the id of the ticket
                                            customer. See other{' '}
                                            <a
                                                href="https://developers.gorgias.com/reference/the-tickethttpintegration-object"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                variables
                                            </a>
                                            .
                                        </div>
                                    }
                                    value={url}
                                    onChange={(value) =>
                                        this.setState({ url: value })
                                    }
                                />
                                <DEPRECATED_InputField
                                    type="select"
                                    name="http.method"
                                    label="HTTP Method"
                                    value={method}
                                    onChange={this._setMethod}
                                    required
                                >
                                    {Object.values(HttpMethod).map((method) => (
                                        <option key={method} value={method}>
                                            {method}
                                        </option>
                                    ))}
                                </DEPRECATED_InputField>
                                {method !== HttpMethod.Get && (
                                    <DEPRECATED_InputField
                                        type="select"
                                        name="http.request_content_type"
                                        label="Request content type"
                                        required
                                        value={requestContentType}
                                        onChange={(value) =>
                                            this._onRequestContentTypeChange(
                                                value,
                                            )
                                        }
                                    >
                                        <option value={ContentType.Json}>
                                            {ContentType.Json}
                                        </option>
                                        <option value={ContentType.Form}>
                                            {ContentType.Form}
                                        </option>
                                    </DEPRECATED_InputField>
                                )}
                                <DEPRECATED_InputField
                                    type="select"
                                    name="http.response_content_type"
                                    label="Response content type"
                                    value={responseContentType}
                                    onChange={(value) =>
                                        this.setState({
                                            responseContentType: value,
                                        })
                                    }
                                    required
                                >
                                    <option value={ContentType.Json}>
                                        {ContentType.Json}
                                    </option>
                                </DEPRECATED_InputField>
                                <FormGroup>
                                    <ObjectListField
                                        title="Header"
                                        fieldName="header"
                                        fields={headers}
                                        validate={this._validateHeaderName}
                                        onChange={(value: Field[]) =>
                                            this.setState({ headers: value })
                                        }
                                    />
                                </FormGroup>
                                {isHttpIntegrationOAuthEnabled && (
                                    <FormGroup>
                                        <ToggleField
                                            label="Enable authentication method: OAuth2"
                                            value={oauth2Enabled}
                                            onChange={(value) =>
                                                this.setState({
                                                    oauth2Enabled: value,
                                                })
                                            }
                                        />
                                        {oauth2Enabled && (
                                            <Box
                                                flexDirection="column"
                                                paddingTop="lg"
                                                gap="md"
                                            >
                                                <TextField
                                                    id="oauth2-token-url"
                                                    type="text"
                                                    label="Token URL"
                                                    value={
                                                        oauth2Config.token_url
                                                    }
                                                    isRequired
                                                    onChange={(value) =>
                                                        this.setState({
                                                            oauth2Config: {
                                                                ...oauth2Config,
                                                                token_url:
                                                                    value,
                                                            },
                                                        })
                                                    }
                                                />
                                                <TextField
                                                    id="oauth2-client-id"
                                                    type="text"
                                                    label="Client ID"
                                                    value={
                                                        oauth2Config.client_id
                                                    }
                                                    isRequired
                                                    onChange={(value) =>
                                                        this.setState({
                                                            oauth2Config: {
                                                                ...oauth2Config,
                                                                client_id:
                                                                    value,
                                                            },
                                                        })
                                                    }
                                                />
                                                <TextField
                                                    id="oauth2-client-secret"
                                                    type="password"
                                                    label="Client Secret"
                                                    placeholder="***********"
                                                    value={
                                                        oauth2Config.client_secret
                                                    }
                                                    isRequired
                                                    onChange={(value) =>
                                                        this.setState({
                                                            oauth2Config: {
                                                                ...oauth2Config,
                                                                client_secret:
                                                                    value,
                                                            },
                                                        })
                                                    }
                                                />
                                                <Box flexDirection="column">
                                                    <Label>
                                                        Token Location
                                                    </Label>
                                                    <Select
                                                        items={Object.values(
                                                            OAuth2TokenLocation,
                                                        ).map((loc) => ({
                                                            id: loc,
                                                            name: loc,
                                                        }))}
                                                        selectedItem={{
                                                            id: oauth2Config.token_location,
                                                            name: oauth2Config.token_location,
                                                        }}
                                                        onSelect={(item) =>
                                                            this.setState({
                                                                oauth2Config: {
                                                                    ...oauth2Config,
                                                                    token_location:
                                                                        item.id as OAuth2TokenLocation,
                                                                },
                                                            })
                                                        }
                                                        trigger={({
                                                            ref,
                                                            selectedText,
                                                            isOpen,
                                                        }) => (
                                                            <SelectTrigger>
                                                                <TextField
                                                                    inputRef={
                                                                        ref as React.RefObject<HTMLInputElement>
                                                                    }
                                                                    value={
                                                                        selectedText
                                                                    }
                                                                    isFocused={
                                                                        isOpen
                                                                    }
                                                                    trailingSlot={
                                                                        isOpen
                                                                            ? 'arrow-chevron-up'
                                                                            : 'arrow-chevron-down'
                                                                    }
                                                                    variant="primary"
                                                                    aria-label="Token Location"
                                                                />
                                                            </SelectTrigger>
                                                        )}
                                                    >
                                                        {(item) => (
                                                            <ListItem
                                                                id={item.id}
                                                                label={
                                                                    item.name
                                                                }
                                                            />
                                                        )}
                                                    </Select>
                                                </Box>
                                                <TextField
                                                    id="oauth2-token-key"
                                                    type="text"
                                                    label="Token Key"
                                                    value={
                                                        oauth2Config.token_key
                                                    }
                                                    isRequired
                                                    onChange={(value) =>
                                                        this.setState({
                                                            oauth2Config: {
                                                                ...oauth2Config,
                                                                token_key:
                                                                    value,
                                                            },
                                                        })
                                                    }
                                                />
                                                <TextField
                                                    id="oauth2-scopes"
                                                    type="text"
                                                    label="Scopes"
                                                    placeholder="Enter"
                                                    value={oauth2Config.scopes}
                                                    onChange={(value) =>
                                                        this.setState({
                                                            oauth2Config: {
                                                                ...oauth2Config,
                                                                scopes: value,
                                                            },
                                                        })
                                                    }
                                                />
                                            </Box>
                                        )}
                                    </FormGroup>
                                )}
                                {method !== HttpMethod.Get &&
                                    (requestContentType === ContentType.Json ? (
                                        <JSONBody
                                            form={form as HTTPForm | null}
                                            onChange={(form: HTTPForm | null) =>
                                                this.setState({ form })
                                            }
                                        />
                                    ) : (
                                        <FormGroup>
                                            <ObjectListField
                                                fieldName="field"
                                                title="Form field"
                                                fields={
                                                    form instanceof Array
                                                        ? (form as any)
                                                        : []
                                                }
                                                onChange={(form) =>
                                                    this.setState({ form })
                                                }
                                            />
                                        </FormGroup>
                                    ))}
                            </>
                        )}

                        <Box justifyContent="space-between">
                            {!isIncomplete && (
                                <Box gap="sm">
                                    <Button
                                        type="submit"
                                        className="mr-2"
                                        isLoading={isSubmitting}
                                        isDisabled={isDisabled}
                                    >
                                        {isUpdate
                                            ? 'Save changes'
                                            : 'Add integration'}
                                    </Button>
                                    {isUpdate && isActive && (
                                        <Button
                                            isLoading={isSubmitting}
                                            intent="destructive"
                                            onClick={() =>
                                                deactivateIntegration(
                                                    integration!.id,
                                                )
                                            }
                                        >
                                            Deactivate HTTP integration
                                        </Button>
                                    )}

                                    {isUpdate && !isActive && (
                                        <Button
                                            isLoading={isSubmitting}
                                            onClick={() =>
                                                activateIntegration(
                                                    integration.id,
                                                )
                                            }
                                        >
                                            Re-activate HTTP integration
                                        </Button>
                                    )}
                                </Box>
                            )}
                            {isUpdate && (
                                <ConfirmButton
                                    className="float-right"
                                    onConfirm={() =>
                                        deleteIntegration(fromJS(integration))
                                    }
                                    confirmationContent={
                                        INTEGRATION_REMOVAL_CONFIGURATION_TEXT
                                    }
                                    intent="destructive"
                                    leadingIcon="delete"
                                >
                                    Delete HTTP integration
                                </ConfirmButton>
                            )}
                        </Box>
                    </Form>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        loading: getIntegrationsLoading(state),
    }),
    {
        activateIntegration,
        deactivateIntegration,
        deleteIntegration,
        updateOrCreateIntegration,
    },
)

const ConnectedIntegration = connector(Integration)

type ConnectedProps_ = ComponentProps<typeof ConnectedIntegration>

function IntegrationWithFeatureFlag(props: ConnectedProps_) {
    const isHttpIntegrationOAuthEnabled = useFlag(
        FeatureFlagKey.HttpIntegrationOAuth,
        false,
    )
    return (
        <ConnectedIntegration
            {...props}
            isHttpIntegrationOAuthEnabled={isHttpIntegrationOAuthEnabled}
        />
    )
}

export default IntegrationWithFeatureFlag
