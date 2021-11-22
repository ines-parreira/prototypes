import React, {Component, SyntheticEvent} from 'react'
import classNames from 'classnames'
import {fromJS, Map} from 'immutable'
import _forIn from 'lodash/forIn'
import _isEmpty from 'lodash/isEmpty'
import {Button, Container, Form, FormGroup, FormText, Label} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'

import {
    TICKET_CREATED,
    TICKET_MESSAGE_CREATED,
    TICKET_UPDATED,
} from '../../../../../../constants/event'
import {
    toJS,
    validateWebhookURL,
    validateWebhookURLToPattern,
} from '../../../../../../utils'
import {
    activateIntegration,
    deactivateIntegration,
    deleteIntegration,
    updateOrCreateIntegration,
} from '../../../../../../state/integrations/actions'

import Loader from '../../../../../common/components/Loader/Loader'
import ObjectListField, {Field} from '../ObjectListField'
import ConfirmButton from '../../../../../common/components/ConfirmButton'
import InputField from '../../../../../common/forms/InputField'
import BooleanField from '../../../../../common/forms/BooleanField.js'

import {ContentType, HttpMethod} from '../../../../../../models/api/types'

import {DEFAULT_FORM} from './constants.js'
import JSONBody from './JSONBody'
import {validateHeaderName} from './httpHeaderValidation.js'

export type HTTPForm =
    | string
    | Record<string, unknown>
    | Array<Record<string, unknown>>

type Props = {
    integration: Map<any, any>
    isUpdate: boolean
    loading: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    description: string
    form: HTTPForm
    headers: Field[]
    isTestShown: boolean
    method: string
    name: string
    requestContentType: string
    responseContentType: string
    ticketCreated: boolean
    ticketMessageCreated: boolean
    ticketUpdated: boolean
    url: string
}

export class HTTPIntegrationOverview extends Component<Props, State> {
    state: State = {
        isTestShown: false,
        name: '',
        description: '',
        url: '',
        method: HttpMethod.Get,
        requestContentType: ContentType.Json,
        responseContentType: ContentType.Json,
        ticketCreated: true,
        ticketUpdated: true,
        ticketMessageCreated: true,
        headers: [],
        form: '',
    }

    isInitialized: boolean | undefined

    componentWillMount() {
        const {integration, isUpdate, loading} = this.props

        // populating the form when updating an integration
        if (
            !this.isInitialized &&
            isUpdate &&
            !loading.get('integration') &&
            !integration.isEmpty()
        ) {
            this.setState(this._getIntegration(integration))
            this.isInitialized = true
        }
    }

    componentWillUpdate(nextProps: Props) {
        const {integration, isUpdate, loading} = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration')) {
            this.setState(this._getIntegration(integration))
            this.isInitialized = true
        }
    }

    _getIntegration = (integration: Map<any, any>) => {
        const isJsonBody =
            integration.getIn(['http', 'request_content_type']) ===
            ContentType.Json
        let formData: HTTPForm = toJS(integration.getIn(['http', 'form']))
        if (!isJsonBody) {
            formData = this._objectToParameters(
                formData as Record<string, unknown>
            )
        }
        const headers = integration.getIn(['http', 'headers']) as Map<any, any>
        return {
            name: integration.get('name'),
            description: integration.get('description') || '',
            headers: this._objectToParameters(
                headers ? (headers.toJS() as Record<string, unknown>) : {}
            ),
            url: integration.getIn(['http', 'url']),
            method: integration.getIn(['http', 'method']),
            requestContentType: integration.getIn([
                'http',
                'request_content_type',
            ]),
            responseContentType: integration.getIn([
                'http',
                'response_content_type',
            ]),
            ticketCreated:
                integration.getIn(['http', 'triggers', 'ticket-created']) ||
                false,
            ticketUpdated:
                integration.getIn(['http', 'triggers', 'ticket-updated']) ||
                false,
            ticketMessageCreated:
                integration.getIn([
                    'http',
                    'triggers',
                    'ticket-message-created',
                ]) || false,
            form: formData,
        }
    }

    _isSubmitting = () => {
        const {loading, integration} = this.props
        return loading.get('updateIntegration') === integration.get('id', true)
    }

    _onRequestContentTypeChange(value: string) {
        const form = this.state.form

        if (value !== ContentType.Json) {
            this.setState({
                form:
                    form instanceof Object
                        ? this._objectToParameters(
                              form as Record<string, unknown>
                          )
                        : form,
                requestContentType: value,
            })
        } else {
            this.setState({
                form:
                    form instanceof Array
                        ? this._parametersToObject(form)
                        : form,
                requestContentType: value,
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
    _parametersToObject(
        params: Array<Record<string, unknown>> = []
    ): Record<string, unknown> {
        if (!params) {
            return {}
        }
        return params.reduce((reduction, param) => {
            const newReduction = reduction
            newReduction[param.key as string] = param.value
            return newReduction
        }, {})
    }

    _handleSubmit = (evt: SyntheticEvent<HTMLFormElement>) => {
        evt.preventDefault()

        let form = this.state.form

        if (this.state.requestContentType !== ContentType.Json) {
            form = form instanceof Array ? this._parametersToObject(form) : form
        }

        const integration: Record<string, unknown> = {
            type: 'http',
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
                    [TICKET_CREATED]: this.state.ticketCreated,
                    [TICKET_UPDATED]: this.state.ticketUpdated,
                    [TICKET_MESSAGE_CREATED]: this.state.ticketMessageCreated,
                },
                form,
            },
        }

        // if update, set ids for server
        if (this.props.isUpdate) {
            integration.id = this.props.integration.get('id')
            ;(integration.http as Record<string, unknown>).id =
                this.props.integration.getIn(['http', 'id'])
        }

        return this.props.updateOrCreateIntegration(fromJS(integration))
    }

    _validateHeaderName = (
        inputType: string,
        value: string
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
        const {isUpdate, integration} = this.props
        const {method, form} = this.state

        const stateUpdate: Record<string, unknown> = {method: newMethod}

        const savedMethodIsGet =
            integration.getIn(['http', 'method']) === HttpMethod.Get
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
            loading,
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
            ticketMessageCreated,
        } = this.state

        const form = this.state.form

        const isSubmitting = this._isSubmitting()

        const isActive = !integration.get('deactivated_datetime')

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <div className="full-width">
                <Container fluid className="page-container">
                    <p>
                        Add the details about the HTTP integration you want to
                        add below. If you need help, you can check our{' '}
                        <a
                            href="https://docs.gorgias.com/data-and-http-integrations/http-integrations"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            docs
                        </a>{' '}
                        or contact us.
                    </p>
                    <Form onSubmit={this._handleSubmit}>
                        <InputField
                            type="text"
                            name="name"
                            label="Integration name"
                            value={name}
                            onChange={(value) => this.setState({name: value})}
                            required
                        />
                        <InputField
                            type="text"
                            name="description"
                            label="Description"
                            value={description}
                            onChange={(value) =>
                                this.setState({description: value})
                            }
                        />
                        <FormGroup>
                            <Label className="control-label">Triggers</Label>
                            <p>
                                <FormText color="muted">
                                    This HTTP integration will be executed when
                                    any of the events below happens.
                                </FormText>
                            </p>
                            <BooleanField
                                name="http.triggers.ticket-created"
                                type="checkbox"
                                label="Ticket created"
                                value={ticketCreated}
                                onChange={(value: boolean) =>
                                    this.setState({ticketCreated: value})
                                }
                            />
                            <BooleanField
                                name="http.triggers.ticket-updated"
                                type="checkbox"
                                label="Ticket updated"
                                value={ticketUpdated}
                                onChange={(value: boolean) =>
                                    this.setState({ticketUpdated: value})
                                }
                            />
                            <BooleanField
                                name="http.triggers.ticket-message-created"
                                type="checkbox"
                                label="Ticket message created"
                                value={ticketMessageCreated}
                                onChange={(value: boolean) =>
                                    this.setState({ticketMessageCreated: value})
                                }
                            />
                        </FormGroup>
                        <InputField
                            type="url"
                            error={validateWebhookURL(url)}
                            name="http.url"
                            label="URL"
                            title="Example: https://company.com/api"
                            placeholder="https://company.com/api/customers?email={{ticket.customer.email}}"
                            required
                            pattern={validateWebhookURLToPattern(url)}
                            help={
                                <div>
                                    You can use{' '}
                                    <code>{'{{ticket.customer.email}}'}</code>{' '}
                                    to pass the email of the ticket customer.
                                    See other{' '}
                                    <a
                                        href="https://developers.gorgias.com/reference#the-customer-object"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        vars
                                    </a>
                                    .
                                </div>
                            }
                            value={url}
                            onChange={(value) => this.setState({url: value})}
                        />
                        <InputField
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
                        </InputField>
                        {method !== HttpMethod.Get && (
                            <InputField
                                type="select"
                                name="http.request_content_type"
                                label="Request content type"
                                required
                                value={requestContentType}
                                onChange={(value) =>
                                    this._onRequestContentTypeChange(value)
                                }
                            >
                                <option value={ContentType.Json}>
                                    {ContentType.Json}
                                </option>
                                <option value={ContentType.Form}>
                                    {ContentType.Form}
                                </option>
                            </InputField>
                        )}
                        <InputField
                            type="select"
                            name="http.response_content_type"
                            label="Response content type"
                            value={responseContentType}
                            onChange={(value) =>
                                this.setState({responseContentType: value})
                            }
                            required
                        >
                            <option value={ContentType.Json}>
                                {ContentType.Json}
                            </option>
                        </InputField>
                        <FormGroup>
                            <ObjectListField
                                title="Header"
                                fieldName="header"
                                fields={headers}
                                validate={this._validateHeaderName}
                                onChange={(value: Field[]) =>
                                    this.setState({headers: value})
                                }
                            />
                        </FormGroup>

                        {method !== HttpMethod.Get &&
                            (requestContentType === ContentType.Json ? (
                                <JSONBody
                                    form={form}
                                    onChange={(form: HTTPForm) =>
                                        this.setState({form})
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
                                        onChange={(
                                            form: Array<Record<string, unknown>>
                                        ) => this.setState({form})}
                                    />
                                </FormGroup>
                            ))}

                        <div>
                            <Button
                                type="submit"
                                color="success"
                                className={classNames('mr-2', {
                                    'btn-loading': isSubmitting,
                                })}
                                disabled={isSubmitting}
                            >
                                {isUpdate ? 'Save changes' : 'Add integration'}
                            </Button>
                            {isUpdate && isActive && (
                                <Button
                                    type="button"
                                    color="warning"
                                    outline
                                    className={classNames({
                                        'btn-loading': isSubmitting,
                                    })}
                                    onClick={() =>
                                        deactivateIntegration(
                                            integration.get('id')
                                        )
                                    }
                                >
                                    Deactivate integration
                                </Button>
                            )}

                            {isUpdate && !isActive && (
                                <Button
                                    type="button"
                                    color="success"
                                    outline
                                    className={classNames({
                                        'btn-loading': isSubmitting,
                                    })}
                                    onClick={() =>
                                        activateIntegration(
                                            integration.get('id')
                                        )
                                    }
                                >
                                    Re-activate integration
                                </Button>
                            )}
                            {isUpdate && (
                                <ConfirmButton
                                    className="float-right"
                                    color="secondary"
                                    confirm={() =>
                                        deleteIntegration(integration)
                                    }
                                    content="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                                >
                                    <i className="material-icons mr-1 text-danger">
                                        delete
                                    </i>
                                    Delete integration
                                </ConfirmButton>
                            )}
                        </div>
                    </Form>
                </Container>
            </div>
        )
    }
}

const connector = connect(null, {
    activateIntegration,
    deactivateIntegration,
    deleteIntegration,
    updateOrCreateIntegration,
})

export default connector(HTTPIntegrationOverview)
