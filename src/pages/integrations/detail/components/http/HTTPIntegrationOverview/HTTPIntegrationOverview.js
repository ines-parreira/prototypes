import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import _merge from 'lodash/merge'
import _pick from 'lodash/pick'
import _forIn from 'lodash/forIn'
import {
    Container,
    Form,
    FormGroup,
    FormText,
    Label,
    Button,
} from 'reactstrap'

import {AVAILABLE_HTTP_METHODS, FORM_CONTENT_TYPE, JSON_CONTENT_TYPE} from '../../../../../../config'
import Loader from '../../../../../common/components/Loader'
import ObjectListField from '../ObjectListField'
import ConfirmButton from '../../../../../common/components/ConfirmButton'
import {hasUnicodeChars} from '../../../../../../utils'

import InputField from '../../../../../common/forms/InputField'
import BooleanField from '../../../../../common/forms/BooleanField'
import JsonField from '../../../../../common/forms/JsonField'
import {toJS, validateWebhookURL, validateWebhookURLToPattern} from '../../../../../../utils'

export const defaultContent = {
    type: 'http',
    http: {
        method: 'GET',
        request_content_type: JSON_CONTENT_TYPE,
        response_content_type: JSON_CONTENT_TYPE,
        triggers: {
            'ticket-created': true,
            'ticket-updated': true
        }
    }
}

export default class HTTPIntegrationOverview extends React.Component {
    static propTypes = {
        integration: PropTypes.object.isRequired,
        isUpdate: PropTypes.bool.isRequired,
        actions: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
    }

    state = {
        isTestShown: false,
        name: '',
        description: '',
        url: '',
        method: defaultContent.http.method,
        requestContentType: defaultContent.http.request_content_type,
        responseContentType: defaultContent.http.response_content_type,
        ticketCreated: defaultContent.http.triggers['ticket-created'],
        ticketUpdated: defaultContent.http.triggers['ticket-updated'],
        ticketMessageCreated: defaultContent.http.triggers['ticket-message-created'],
        headers: [],
        form: ''
    }

    constructor(props) {
        super(props)

        this.isInitialized = !props.isUpdate
    }

    componentWillMount() {
        const {integration, isUpdate, loading} = this.props

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration') && !integration.isEmpty()) {
            this.setState(this._getIntegration(integration))
            this.isInitialized = true
        }
    }

    componentWillUpdate(nextProps) {
        const {integration, isUpdate, loading} = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration')) {
            this.setState(this._getIntegration(integration))
            this.isInitialized = true
        }
    }

    _getIntegration = (integration) => {
        let isJsonBody = integration.getIn(['http', 'request_content_type']) === JSON_CONTENT_TYPE
        let formData = toJS(integration.getIn(['http', 'form']))
        if (!isJsonBody) {
            formData = this._objectToParameters(formData)
        }
        return {
            name: integration.get('name'),
            description: integration.get('description') || '',
            headers: this._objectToParameters(
                (integration.getIn(['http', 'headers']) || {}).toJS()
            ),
            url: integration.getIn(['http', 'url']),
            method: integration.getIn(['http', 'method']),
            requestContentType: integration.getIn(['http', 'request_content_type']),
            responseContentType: integration.getIn(['http', 'response_content_type']),
            ticketCreated: integration.getIn(['http', 'triggers', 'ticket-created']),
            ticketUpdated: integration.getIn(['http', 'triggers', 'ticket-updated']),
            ticketMessageCreated: integration.getIn(['http', 'triggers', 'ticket-message-created']),
            form: formData
        }
    }

    _isSubmitting = () => {
        const {loading, integration} = this.props
        return loading.get('updateIntegration') === integration.get('id', true)
    }

    _onRequestContentTypeChange(value) {
        if (value !== JSON_CONTENT_TYPE) {
            this.setState({
                form: this._objectToParameters(this.state.form),
                requestContentType: value
            })
        } else {
            this.setState({
                form: this._parametersToObject(this.state.form),
                requestContentType: value
            })
        }
    }

    /**
     * Transform an object like {key1: value1} into parameter format {key: key1, value: value1}
     * @param o
     * @returns {Array}
     * @private
     */
    _objectToParameters(o = {}) {
        const obj = o || {}
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
    _parametersToObject(params) {
        if (!params) {
            return {}
        }
        return params.reduce((reduction, param) => {
            const newDeduction = reduction
            newDeduction[param.key] = param.value
            return newDeduction
        }, {})
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const doc = _merge(_pick(this.state, [
            'type',
            'name',
            'description'
        ]), defaultContent)
        // transforming headers into objects
        doc.http.headers = this._parametersToObject(this.state.headers)
        doc.http.url = this.state.url
        doc.http.method = this.state.method
        doc.http.request_content_type = this.state.requestContentType
        doc.http.response_content_type = this.state.responseContentType
        doc.http.triggers['ticket-created'] = this.state.ticketCreated
        doc.http.triggers['ticket-updated'] = this.state.ticketUpdated
        doc.http.triggers['ticket-message-created'] = this.state.ticketMessageCreated

        if (this.state.requestContentType === JSON_CONTENT_TYPE) {
            doc.http.form = this.state.form
        } else {
            doc.http.form = this._parametersToObject(this.state.form)
        }

        // if update, set ids for server
        if (this.props.isUpdate) {
            const {integration} = this.props
            doc.id = integration.get('id')
            doc.http.id = integration.getIn(['http', 'id'])
        }

        return this.props.actions.updateOrCreateIntegration(fromJS(doc))
    }

    validateHeaderName = (fieldName: string, fieldValue: string): ?string => {
        if (fieldName === 'key' && hasUnicodeChars(fieldValue)) {
            return 'Header\'s name can\'t contain unicode characters.'
        }
    }

    render() {
        const {actions, integration, isUpdate, loading} = this.props
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
                            value={this.state.name}
                            onChange={(value) => this.setState({name: value})}
                            required
                        />
                        <InputField
                            type="text"
                            name="description"
                            label="Description"
                            value={this.state.description}
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
                                value={this.state.ticketCreated}
                                onChange={(value) => this.setState({ticketCreated: value})}
                            />
                            <BooleanField
                                name="http.triggers.ticket-updated"
                                type="checkbox"
                                label="Ticket updated"
                                value={this.state.ticketUpdated}
                                onChange={(value) => this.setState({ticketUpdated: value})}
                            />
                            <BooleanField
                                name="http.triggers.ticket-message-created"
                                type="checkbox"
                                label="Ticket message created"
                                value={this.state.ticketMessageCreated}
                                onChange={(value) => this.setState({ticketMessageCreated: value})}
                            />
                        </FormGroup>
                        <InputField
                            type="url"
                            error={validateWebhookURL(this.state.url)}
                            name="http.url"
                            label="URL"
                            title='Example: https://company.com/api'
                            placeholder="https://company.com/api/customers?email={{ticket.customer.email}}"
                            required
                            pattern={validateWebhookURLToPattern(this.state.url)}
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
                            value={this.state.url}
                            onChange={(value) => this.setState({url: value})}
                        />
                        <InputField
                            type="select"
                            name="http.method"
                            label="HTTP Method"
                            value={this.state.method}
                            onChange={(value) => this.setState({method: value})}
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
                            this.state.method !== 'GET' && (
                                <InputField
                                    type="select"
                                    name="http.request_content_type"
                                    label="Request content type"
                                    required
                                    value={this.state.requestContentType}
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
                            value={this.state.responseContentType}
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
                                fields={this.state.headers}
                                validate={this.validateHeaderName}
                                onChange={(value) => this.setState({headers: value})}
                            />
                        </FormGroup>

                        {
                            this.state.method !== 'GET' && (
                                this.state.requestContentType === JSON_CONTENT_TYPE ? (
                                    <JsonField
                                        name="http.form"
                                        label="Request Body (JSON)"
                                        rows="8"
                                        value={this.state.form}
                                        onChange={(value) => this.setState({form: value})}
                                    />
                                ) : (
                                    <FormGroup>
                                        <ObjectListField
                                            name="http.form"
                                            fieldName="field"
                                            title="Form field"
                                            fields={this.state.form}
                                            onChange={(value) => this.setState({form: value})}
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
