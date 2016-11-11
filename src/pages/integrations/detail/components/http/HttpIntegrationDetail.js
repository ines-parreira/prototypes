import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {Field, FieldArray, reduxForm} from 'redux-form'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import _clone from 'lodash/clone'
import _cloneDeep from 'lodash/cloneDeep'
import _forIn from 'lodash/forIn'
import {AVAILABLE_HTTP_METHODS} from '../../../../../config'
import {Loader} from '../../../../common/components/Loader'
import {
    InputField,
    SelectField,
    MultiSelectField,
    JsonField,
    URLInputField
} from '../../../../common/components/formFields'
import HeaderFieldArray from './HeaderFieldArray'
import formSender from '../../../../common/utils/formSender'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

// import HttpIntegrationTesting from './HttpIntegrationTesting'

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

    _handleTest = (data) => {
        // sending test to server
        this.props.actions.testHttpIntegration(data)
    }

    render() {
        const {actions, handleSubmit, integration, isUpdate, loading} = this.props

        // const { isTestShown } = this.state

        const isSubmitting = loading.get('updateIntegration')

        const isActive = !integration.get('deactivated_datetime')

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <div className="ui grid">
                <div className="sixteen wide column">

                    <div className="ui large breadcrumb">
                        <Link to="/app/integrations">Integrations</Link>
                        <i className="right angle icon divider" />
                        <Link to="/app/integrations/http" className="section">HTTP</Link>
                        <i className="right angle icon divider" />
                        <a className="active section">{isUpdate ? integration.get('name') : 'Add integration'}</a>
                    </div>

                    <h1>{isUpdate ? integration.get('name') : 'Add integration'}</h1>
                    <div>Let's configure this HTTP integration.</div>
                </div>

                <div className="ten wide column">
                    <form
                        className="ui form"
                        onSubmit={handleSubmit(this._handleSubmit)}
                    >
                        <Field
                            name="name"
                            label="Name"
                            placeholder="Name"
                            required
                            component={InputField}
                        />
                        <Field
                            name="description"
                            label="Description"
                            placeholder="Description"
                            component={InputField}
                        />
                        <Field
                            name="http.url"
                            label="URL"
                            placeholder="URL"
                            ref="httpUrl"
                            required
                            component={URLInputField}
                        />
                        <Field
                            name="http.method"
                            label="Method"
                            placeholder="Method"
                            required
                            component={SelectField}
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
                            name="http.request_content_type"
                            label="Request content type"
                            required
                            component={SelectField}
                        >
                            <option value="application/json">application/json</option>
                        </Field>
                        <Field
                            type="text"
                            name="http.response_content_type"
                            label="Response content type"
                            required
                            component={SelectField}
                        >
                            <option value="application/json">application/json</option>
                        </Field>

                        <FieldArray
                            name="http.headers"
                            component={HeaderFieldArray}
                        />

                        <Field
                            name="http.form"
                            label="Request Body (JSON)"
                            component={JsonField}
                        />

                        <Field
                            name="http.triggers"
                            label="Triggers"
                            placeholder="Triggers"
                            description="This HTTP integration will be executed when any of the events below happened"
                            ref="httpTriggers"
                            required
                            component={MultiSelectField}
                            options={[
                                {
                                    label: 'Ticket Created',
                                    slug: 'ticket-created'
                                },
                                {
                                    label: 'Ticket Updated',
                                    slug: 'ticket-updated'
                                }
                            ]}
                        />

                        <div className="field">

                            {/* isUpdate && (
                             <button
                             className={classNames('ui', 'teal', 'button', {
                             loading: isSubmitting
                             })}
                             type="button"
                             disabled={isSubmitting}
                             onClick={() => {
                             this.setState({isTestShown: !this.state.isTestShown})
                             }}
                             >
                             Test
                             </button>
                             ) */}

                            <button
                                type="submit"
                                className={classNames('ui green button', {
                                    loading: isSubmitting
                                })}
                                disabled={isSubmitting}
                            >
                                {isUpdate ? 'Save changes' : 'Add integration'}
                            </button>
                            {isUpdate && isActive && (
                                <button
                                    type="button"
                                    className={classNames('ui basic light floated orange button', {
                                        loading: isSubmitting
                                    })}
                                    onClick={() => !isSubmitting && actions.deactivateIntegration(integration)}
                                >
                                    Deactivate
                                </button>
                            )}
                            {isUpdate && !isActive && (
                                <button
                                    type="button"
                                    className={classNames('ui basic light blue floated button', {
                                        loading: isSubmitting
                                    })}
                                    onClick={() => !isSubmitting && actions.activateIntegration(integration)}
                                >
                                    Re-Activate
                                </button>
                            )}

                            {isUpdate && (
                                <button
                                    type="button"
                                    className="ui basic light floated right red button"
                                    onClick={() => actions.deleteIntegration(integration)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </form>

                    {/*
                     <div>
                     <ReactCSSTransitionGroup
                     transitionName="fade"
                     transitionEnterTimeout={200}
                     transitionLeaveTimeout={200}
                     >
                     {isTestShown && (
                     <div>
                     <br />
                     <HttpIntegrationTesting
                     url={this.refs.httpUrl.value || ''}
                     integration={this.props.integration}
                     loading={this.props.loading}
                     test={this._handleTest}
                     />
                     </div>
                     )}
                     </ReactCSSTransitionGroup>
                     </div>
                     */}

                </div>
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
