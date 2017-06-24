import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {Field, FieldArray, reduxForm} from 'redux-form'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import _clone from 'lodash/clone'
import _cloneDeep from 'lodash/cloneDeep'
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
import formSender from '../../../../common/utils/formSender'
import ConfirmButton from '../../../../common/components/ConfirmButton'

import ReduxFormInputField from '../../../../common/forms/ReduxFormInputField'
import BooleanField from '../../../../common/forms/BooleanField'
import JsonField from '../../../../common/forms/JsonField'

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

class HttpIntegrationDetail extends React.Component {
    constructor(props) {
        super(props)

        this.state = {isTestShown: false}

        // used to know if form has been asynchronously initialized when updating
        this.isInitialized = !props.isUpdate

        // populating new integration form
        if (!props.isUpdate) {
            props.initialize(_clone(defaultContent))
        }
    }

    componentWillUpdate(nextProps) {
        const {integration, isUpdate, loading} = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration')) {
            const updatedIntegration = integration.toJS()

            // transforming 'headers' and 'form' into arrays
            const transformationList = ['headers']
            transformationList.forEach((param) => {
                updatedIntegration.http[param] = this._objectToParameters(
                    updatedIntegration.http[param]
                )
            })

            this.props.initialize(updatedIntegration)
            this.isInitialized = true
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

    _handleSubmit = (values) => {
        // We create a deep copy of values because it is a reference to the redux state
        // The following transformations DON'T HAVE TO EDIT the redux state
        let doc = _cloneDeep(values)

        // transforming 'headers' and 'form' into objects
        const transformationList = ['headers']
        transformationList.forEach((param) => {
            doc.http[param] = this._parametersToObject(doc.http[param])
        })

        doc = fromJS(defaultContent).mergeDeep(doc)

        // if update, set ids for server
        if (this.props.isUpdate) {
            const {integration} = this.props
            doc = doc
                .set('id', integration.get('id'))
                .setIn(['http', 'id'], integration.getIn(['http', 'id']))
        }

        return formSender(this.props.actions.updateOrCreateIntegration(doc))
    }

    render() {
        const {actions, handleSubmit, integration, isUpdate, loading} = this.props

        const isSubmitting = loading.get('updateIntegration')

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

                <Form onSubmit={handleSubmit(this._handleSubmit)}>
                    <Field
                        type="text"
                        name="name"
                        label="Integration name"
                        required
                        component={ReduxFormInputField}
                    />
                    <Field
                        type="text"
                        name="description"
                        label="Description"
                        component={ReduxFormInputField}
                    />
                    <FormGroup>
                        <Label className="control-label">Triggers</Label>
                        <p>
                            <FormText color="muted">
                                This HTTP integration will be executed when any of the events below happens.
                            </FormText>
                        </p>
                        <Field
                            name="http.triggers.ticket-created"
                            type="checkbox"
                            label="Ticket created"
                            component={ReduxFormInputField}
                            tag={BooleanField}
                        />
                        <Field
                            name="http.triggers.ticket-updated"
                            type="checkbox"
                            label="Ticket updated"
                            component={ReduxFormInputField}
                            tag={BooleanField}
                        />
                    </FormGroup>
                    <Field
                        type="text"
                        name="http.url"
                        label="URL"
                        placeholder="https://company.com/api/users?email={ticket.requester.email}"
                        required
                        help={(
                            <div>
                                You can use <code>{'{ticket.requester.email}'}</code> to pass the email of the
                                ticket requester. See
                                other <a href="http://docs.gorgias.io/#/definitions/User" target="_blank">vars</a>.
                            </div>
                        )}
                        component={ReduxFormInputField}
                    />
                    <Field
                        type="select"
                        name="http.method"
                        label="HTTP Method"
                        required
                        component={ReduxFormInputField}
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
                    </Field>
                    <Field
                        type="select"
                        name="http.request_content_type"
                        label="Request content type"
                        required
                        component={ReduxFormInputField}
                    >
                        <option value="application/json">application/json</option>
                    </Field>
                    <Field
                        type="select"
                        name="http.response_content_type"
                        label="Response content type"
                        required
                        component={ReduxFormInputField}
                    >
                        <option value="application/json">application/json</option>
                    </Field>
                    <FormGroup>
                        <FieldArray
                            name="http.headers"
                            component={HeaderFieldArray}
                        />
                    </FormGroup>
                    <Field
                        name="http.form"
                        label="Request Body (JSON)"
                        rows="8"
                        component={ReduxFormInputField}
                        tag={JsonField}
                    />

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

HttpIntegrationDetail.propTypes = {
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    integration: PropTypes.object.isRequired,
    isUpdate: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
}

export default reduxForm({
    form: 'httpIntegration',
})(HttpIntegrationDetail)
