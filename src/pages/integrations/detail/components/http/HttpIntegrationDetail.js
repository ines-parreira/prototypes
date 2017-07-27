import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import _merge from 'lodash/merge'
import _pick from 'lodash/pick'
import _forIn from 'lodash/forIn'
import {
    Form,
    FormGroup,
    FormText,
    Label,
    Button,
    Breadcrumb,
    BreadcrumbItem,
} from 'reactstrap'

import {AVAILABLE_HTTP_METHODS} from '../../../../../config'
import Loader from '../../../../common/components/Loader'
import HeaderFieldArray from './HeaderFieldArray'
import ConfirmButton from '../../../../common/components/ConfirmButton'

import InputField from '../../../../common/forms/InputField'
import BooleanField from '../../../../common/forms/BooleanField'
import JsonField from '../../../../common/forms/JsonField'
import {toJS, validateWebhookURL} from '../../../../../utils'

export const defaultContent = {
    type: 'http',
    http: {
        method: 'GET',
        request_content_type: 'application/json',
        response_content_type: 'application/json',
        triggers: {
            'ticket-created': true,
            'ticket-updated': true
        }
    }
}

export default class HttpIntegrationDetail extends React.Component {
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
        headers: [],
        form: undefined
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
        return {
            name: integration.get('name'),
            description: integration.get('description') || '',
            headers: this._objectToParameters(
                integration.getIn(['http', 'headers']).toJS()
            ),
            url: integration.getIn(['http', 'url']),
            method: integration.getIn(['http', 'method']),
            requestContentType: integration.getIn(['http', 'request_content_type']),
            responseContentType: integration.getIn(['http', 'response_content_type']),
            ticketCreated: integration.getIn(['http', 'triggers', 'ticket-created']),
            ticketUpdated: integration.getIn(['http', 'triggers', 'ticket-updated']),
            form: toJS(integration.getIn(['http', 'form']))
        }
    }

    _isSubmitting = () => {
        const {loading, integration} = this.props
        return loading.get('updateIntegration') === integration.get('id', true)
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
        doc.http.form = this.state.form

        // if update, set ids for server
        if (this.props.isUpdate) {
            const {integration} = this.props
            doc.id = integration.get('id')
            doc.http.id = integration.getIn(['http', 'id'])
        }

        return this.props.actions.updateOrCreateIntegration(fromJS(doc))
    }

    render() {
        const {actions, integration, isUpdate, loading} = this.props
        const isSubmitting = this._isSubmitting()

        const isActive = !integration.get('deactivated_datetime')

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
                        <Link to="/app/integrations/http">HTTP</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        {isUpdate ? integration.get('name') : 'Add'}
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1>{isUpdate ? integration.get('name') : 'Add new HTTP integration'}</h1>

                <p>
                    Add the details about the HTTP integration you want to add below. If you need help, you can
                    check our {' '}
                    <a
                        href="http://docs.gorgias.io/integrations/http-integrations#Connecting_your_own_back-office"
                        target="_blank"
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
                        onChange={value => this.setState({name: value})}
                        required
                    />
                    <InputField
                        type="text"
                        name="description"
                        label="Description"
                        value={this.state.description}
                        onChange={value => this.setState({description: value})}
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
                            onChange={value => this.setState({ticketCreated: value})}
                        />
                        <BooleanField
                            name="http.triggers.ticket-updated"
                            type="checkbox"
                            label="Ticket updated"
                            value={this.state.ticketUpdated}
                            onChange={value => this.setState({ticketUpdated: value})}
                        />
                    </FormGroup>
                    <InputField
                        type="text"
                        error={validateWebhookURL(this.state.url)}
                        name="http.url"
                        label="URL"
                        title='Example: https://company.com/api'
                        placeholder="https://company.com/api/users?email={ticket.requester.email}"
                        required
                        help={(
                            <div>
                                You can use <code>{'{ticket.requester.email}'}</code> to pass the email of the
                                ticket requester. See
                                other <a href="http://docs.gorgias.io/#/definitions/User" target="_blank">vars</a>.
                            </div>
                        )}
                        value={this.state.url}
                        onChange={value => this.setState({url: value})}
                    />
                    <InputField
                        type="select"
                        name="http.method"
                        label="HTTP Method"
                        value={this.state.method}
                        onChange={value => this.setState({method: value})}
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
                    <InputField
                        type="select"
                        name="http.request_content_type"
                        label="Request content type"
                        required
                        value={this.state.requestContentType}
                        onChange={value => this.setState({requestContentType: value})}
                    >
                        <option value="application/json">application/json</option>
                    </InputField>
                    <InputField
                        type="select"
                        name="http.response_content_type"
                        label="Response content type"
                        value={this.state.responseContentType}
                        onChange={value => this.setState({responseContentType: value})}
                        required
                    >
                        <option value="application/json">application/json</option>
                    </InputField>
                    <FormGroup>
                        <HeaderFieldArray
                            name="http.headers"
                            fields={this.state.headers}
                            onChange={value => this.setState({headers: value})}
                        />
                    </FormGroup>

                    {
                        this.state.method !== 'GET' && (
                            <JsonField
                                name="http.form"
                                label="Request Body (JSON)"
                                rows="8"
                                value={this.state.form}
                                onChange={value => this.setState({form: value})}
                            />
                        )
                    }

                    <div>
                        <Button
                            type="submit"
                            color="primary"
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
                                    className="pull-right"
                                    color="danger"
                                    confirm={() => actions.deleteIntegration(integration)}
                                    content="Are you sure you want to delete this integration?"
                                >
                                    Delete
                                </ConfirmButton>
                            )
                        }
                    </div>
                </Form>
            </div>
        )
    }

}
