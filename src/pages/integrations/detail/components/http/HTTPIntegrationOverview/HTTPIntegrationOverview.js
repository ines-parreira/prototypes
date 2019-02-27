// @flow
import React from 'react'
import classNames from 'classnames'
import {fromJS, type Map} from 'immutable'
import _forIn from 'lodash/forIn'
import _isEmpty from 'lodash/isEmpty'
import {
    Container,
    Form,
    FormGroup,
    FormText,
    Label,
    Button,
} from 'reactstrap'

import {AVAILABLE_HTTP_METHODS, FORM_CONTENT_TYPE, HTTP_METHOD_GET, JSON_CONTENT_TYPE} from '../../../../../../config'
import {TICKET_CREATED, TICKET_MESSAGE_CREATED, TICKET_UPDATED} from '../../../../../../constants/events'
import {toJS, validateWebhookURL, validateWebhookURLToPattern, hasUnicodeChars} from '../../../../../../utils'

import Loader from '../../../../../common/components/Loader'
import ObjectListField from '../ObjectListField'
import ConfirmButton from '../../../../../common/components/ConfirmButton'
import InputField from '../../../../../common/forms/InputField'
import BooleanField from '../../../../../common/forms/BooleanField'

import {DEFAULT_FORM} from './constants'
import JSONBody from './JSONBody'


type Props = {
    integration: Map<*, *>,
    isUpdate: boolean,
    actions: Object,
    loading: Map<*, *>
}

type State = {
    isTestShown: boolean,
    name: string,
    description: string,
    url: string,
    method: string,
    requestContentType: string,
    responseContentType: string,
    ticketCreated: boolean,
    ticketUpdated: boolean,
    ticketMessageCreated: boolean,
    headers: Array<Object>,
    form: string | Object | Array<Object>
}

export default class HTTPIntegrationOverview extends React.Component<Props, State> {
    state = {
        isTestShown: false,
        name: '',
        description: '',
        url: '',
        method: HTTP_METHOD_GET,
        requestContentType: JSON_CONTENT_TYPE,
        responseContentType: JSON_CONTENT_TYPE,
        ticketCreated: true,
        ticketUpdated: true,
        ticketMessageCreated: true,
        headers: [],
        form: ''
    }

    isInitialized: boolean

    componentWillMount() {
        const {integration, isUpdate, loading} = this.props

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration') && !integration.isEmpty()) {
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

    _getIntegration = (integration: Map<*, *>) => {
        let isJsonBody = integration.getIn(['http', 'request_content_type']) === JSON_CONTENT_TYPE
        let formData = toJS(integration.getIn(['http', 'form']))
        if (!isJsonBody) {
            formData = this._objectToParameters(formData)
        }
        const headers = integration.getIn(['http', 'headers'])
        return {
            name: integration.get('name'),
            description: integration.get('description') || '',
            headers: this._objectToParameters(headers ? headers.toJS() : {}),
            url: integration.getIn(['http', 'url']),
            method: integration.getIn(['http', 'method']),
            requestContentType: integration.getIn(['http', 'request_content_type']),
            responseContentType: integration.getIn(['http', 'response_content_type']),
            ticketCreated: integration.getIn(['http', 'triggers', 'ticket-created']) || false,
            ticketUpdated: integration.getIn(['http', 'triggers', 'ticket-updated']) || false,
            ticketMessageCreated: integration.getIn(['http', 'triggers', 'ticket-message-created']) || false,
            form: formData
        }
    }

    _isSubmitting = () => {
        const {loading, integration} = this.props
        return loading.get('updateIntegration') === integration.get('id', true)
    }

    _onRequestContentTypeChange(value: string) {
        const {form} = this.state

        if (value !== JSON_CONTENT_TYPE) {
            this.setState({
                form: form instanceof Object ? this._objectToParameters(form) : form,
                requestContentType: value
            })
        } else {
            this.setState({
                form: form instanceof Array ? this._parametersToObject(form) : form,
                requestContentType: value
            })
        }
    }

    /**
     * Transform an object like {key1: value1} into parameter format {key: key1, value: value1}
     * @param object
     * @returns {Array}
     * @private
     */
    _objectToParameters(object: Object = {}): Array<*> {
        const obj = object || {}
        const params = []
        _forIn(obj, (value, key) => {
            params.push({
                key,
                value
            })
        })
        return params
    }

    /**
     * Transform a parameter format like {key: key1, value: value1} into object {key1: value1}
     * @param params
     * @returns {*|{}}
     * @private
     */
    _parametersToObject(params: Array<*> = []): Object {
        if (!params) {
            return {}
        }
        return params.reduce((reduction, param) => {
            const newReduction = reduction
            newReduction[param.key] = param.value
            return newReduction
        }, {})
    }

    _handleSubmit = (evt: Event) => {
        evt.preventDefault()

        let form = this.state.form

        if (this.state.requestContentType !== JSON_CONTENT_TYPE) {
            form = form instanceof Array ? this._parametersToObject(form) : form
        }

        const integration = {
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
                    [TICKET_MESSAGE_CREATED]: this.state.ticketMessageCreated
                },
                form
            }
        }

        // if update, set ids for server
        if (this.props.isUpdate) {
            //$FlowFixMe -- doesn't support adding properties to object literals
            integration.id = this.props.integration.get('id')
            //$FlowFixMe -- doesn't support adding properties to object literals
            integration.http.id = this.props.integration.getIn(['http', 'id'])
        }

        return this.props.actions.updateOrCreateIntegration(fromJS(integration))
    }

    _validateHeaderName = (fieldName: string, fieldValue: string): ?string => {
        if (fieldName === 'key' && hasUnicodeChars(fieldValue)) {
            return 'Header\'s name can\'t contain unicode characters.'
        }
    }

    _setMethod = (newMethod: string) => {
        const {isUpdate, integration} = this.props
        const {method, form} = this.state

        let stateUpdate = {method: newMethod}

        const savedMethodIsGet = !!(integration.getIn(['http', 'method']) === HTTP_METHOD_GET)
        const isSwitchingFromGetToOther = method === HTTP_METHOD_GET && newMethod !== HTTP_METHOD_GET
        const formIsEmpty = !form || _isEmpty(form)

        if ((!isUpdate || savedMethodIsGet) &&
            isSwitchingFromGetToOther &&
            formIsEmpty
        ) {
            //$FlowFixMe -- doesn't support adding properties to object literals
            stateUpdate.form = DEFAULT_FORM
        }

        this.setState(stateUpdate)
    }

    render() {
        const {actions, integration, isUpdate, loading} = this.props
        const {
            method,
            name, description, url, requestContentType, responseContentType, headers, form,
            ticketCreated, ticketUpdated, ticketMessageCreated
        } = this.state

        const isSubmitting = this._isSubmitting()

        const isActive = !integration.get('deactivated_datetime')

        if (loading.get('integration')) {
            return <Loader/>
        }

        return (
            <div className="full-width">
                <Container
                    fluid
                    className="page-container"
                >
                    <p>
                        Add the details about the HTTP integration you want to add below. If you need help, you can
                        check our {' '}
                        <a
                            href="https://docs.gorgias.io/data-and-http-integrations/http-integrations"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            docs
                        </a> or contact us.
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
                            onChange={(value) => this.setState({description: value})}
                        />
                        <FormGroup>
                            <Label className="control-label">Triggers</Label>
                            <p>
                                <FormText color="muted">
                                    This HTTP integration will be executed when any of the events below happens.
                                </FormText>
                            </p>
                            <BooleanField
                                name="http.triggers.ticket-created"
                                type="checkbox"
                                label="Ticket created"
                                value={ticketCreated}
                                onChange={(value) => this.setState({ticketCreated: value})}
                            />
                            <BooleanField
                                name="http.triggers.ticket-updated"
                                type="checkbox"
                                label="Ticket updated"
                                value={ticketUpdated}
                                onChange={(value) => this.setState({ticketUpdated: value})}
                            />
                            <BooleanField
                                name="http.triggers.ticket-message-created"
                                type="checkbox"
                                label="Ticket message created"
                                value={ticketMessageCreated}
                                onChange={(value) => this.setState({ticketMessageCreated: value})}
                            />
                        </FormGroup>
                        <InputField
                            type="url"
                            error={validateWebhookURL(url)}
                            name="http.url"
                            label="URL"
                            title='Example: https://company.com/api'
                            placeholder="https://company.com/api/customers?email={{ticket.customer.email}}"
                            required
                            pattern={validateWebhookURLToPattern(url)}
                            help={(
                                <div>
                                    You can use <code>{'{{ticket.customer.email}}'}</code> to pass the email of the
                                    ticket customer. See
                                    other <a
                                    href="https://api.gorgias.io/#Customer-object"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >vars</a>.
                                </div>
                            )}
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
                            {
                                AVAILABLE_HTTP_METHODS.map((method) =>
                                    <option
                                        key={method}
                                        value={method}
                                    >
                                        {method}
                                    </option>
                                )
                            }
                        </InputField>
                        {
                            method !== HTTP_METHOD_GET && (
                                <InputField
                                    type="select"
                                    name="http.request_content_type"
                                    label="Request content type"
                                    required
                                    value={requestContentType}
                                    onChange={(value) => this._onRequestContentTypeChange(value)}
                                >
                                    <option value={JSON_CONTENT_TYPE}>{JSON_CONTENT_TYPE}</option>
                                    <option value={FORM_CONTENT_TYPE}>{FORM_CONTENT_TYPE}</option>
                                </InputField>
                            )
                        }
                        <InputField
                            type="select"
                            name="http.response_content_type"
                            label="Response content type"
                            value={responseContentType}
                            onChange={(value) => this.setState({responseContentType: value})}
                            required
                        >
                            <option value={JSON_CONTENT_TYPE}>{JSON_CONTENT_TYPE}</option>
                        </InputField>
                        <FormGroup>
                            <ObjectListField
                                name="http.headers"
                                title="Header"
                                fieldName="header"
                                fields={headers}
                                validate={this._validateHeaderName}
                                onChange={(value) => this.setState({headers: value})}
                            />
                        </FormGroup>

                        {
                            method !== HTTP_METHOD_GET && (
                                requestContentType === JSON_CONTENT_TYPE ? (
                                    <JSONBody
                                        form={form}
                                        onChange={(form) => this.setState({form})}
                                    />
                                ) : (
                                    <FormGroup>
                                        <ObjectListField
                                            name="http.form"
                                            fieldName="field"
                                            title="Form field"
                                            fields={form instanceof Array ? form : []}
                                            onChange={(form) => this.setState({form})}
                                        />
                                    </FormGroup>
                                )

                            )
                        }

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

                            {
                                isUpdate && isActive && (
                                    <Button
                                        type="button"
                                        color="warning"
                                        outline
                                        className={classNames({
                                            'btn-loading': isSubmitting,
                                        })}
                                        onClick={() => actions.deactivateIntegration(integration.get('id'))}
                                    >
                                        Deactivate integration
                                    </Button>
                                )
                            }

                            {
                                isUpdate && !isActive && (
                                    <Button
                                        type="button"
                                        color="success"
                                        outline
                                        className={classNames({
                                            'btn-loading': isSubmitting,
                                        })}
                                        onClick={() => actions.activateIntegration(integration.get('id'))}
                                    >
                                        Re-activate integration
                                    </Button>
                                )
                            }

                            {
                                isUpdate && (
                                    <ConfirmButton
                                        className="float-right"
                                        color="secondary"
                                        confirm={() => actions.deleteIntegration(integration)}
                                        content="Are you sure you want to delete this integration?"
                                    >
                                        <i className="material-icons mr-1 text-danger">
                                            delete
                                        </i>
                                        Delete integration
                                    </ConfirmButton>
                                )
                            }
                        </div>
                    </Form>
                </Container>
            </div>
        )
    }

}
