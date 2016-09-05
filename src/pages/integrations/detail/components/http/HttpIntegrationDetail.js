import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import {forIn as _forIn} from 'lodash'
import {reduxForm} from 'redux-form'
import {Loader} from '../../../../common/components/Loader'
import HttpIntegrationTesting from './HttpIntegrationTesting'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export const fields = [
    'name',
    'description',
    'http.url',
    'http.method',
    'http.request_content_type',
    'http.headers[].key',
    'http.headers[].value',
    'http.form[].key',
    'http.form[].value'
]

export const defaultContent = {
    type: 'http',
    http: {
        method: 'GET',
        request_content_type: 'application/json'
    }
}

class HttpIntegrationDetail extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isTestShown: false
        }

        this._handleTest = this._handleTest.bind(this)
        this._handleSubmit = this._handleSubmit.bind(this)

        // used to know if form has been asynchronously initialized when updating
        this.isInitialized = !props.isUpdate

        // populating new integration form
        if (!props.isUpdate) {
            props.initializeForm(defaultContent)
        }
    }

    componentWillUpdate(nextProps) {
        const {
            integration,
            isUpdate,
            loading
        } = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration')) {
            const updatedIntegration = integration.toJS()

            // transforming 'headers' and 'form' into arrays
            const transformationList = ['headers', 'form']
            transformationList.forEach((param) => {
                updatedIntegration.http[param] = this._objectToParameters(updatedIntegration.http[param])
            })

            this.props.initializeForm(updatedIntegration)
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
        return params.reduce((reduction, param) => {
            const newDeduction = reduction
            newDeduction[param.key] = param.value
            return newDeduction
        }, {})
    }

    _handleSubmit(data) {
        let doc = data

        // transforming 'headers' and 'form' into objects
        const transformationList = ['headers', 'form']
        transformationList.forEach((param) => {
            doc.http[param] = this._parametersToObject(data.http[param])
        })

        doc = fromJS(defaultContent).mergeDeep(doc)

        // if update, set ids for server
        if (this.props.isUpdate) {
            const integration = this.props.integration
            doc = doc
                .set('id', integration.get('id'))
                .setIn(['http', 'id'], integration.getIn(['http', 'id']))
        }

        this.props.actions.updateOrCreateIntegration(doc)
    }

    _handleTest(data) {
        // sending test to server
        this.props.actions.testHttpIntegration(data)
    }

    render() {
        const {
            fields: {
                name,
                description,
                http
            },
            actions,
            isUpdate,
            integration,
            loading
        } = this.props

        const {
            isTestShown
        } = this.state

        const isSubmitting = loading.get('updateIntegration')

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <div className="ui grid">
                <div className="sixteen wide column">

                    <div className="ui large breadcrumb">
                        <Link to="/app/integrations">Integrations</Link>
                        <i className="right angle icon divider" />
                        <Link to="/app/integrations/http" className="section">Http</Link>
                        <i className="right angle icon divider" />
                        <a className="active section">{isUpdate ? integration.get('name') : 'Add integration'}</a>
                    </div>

                    <h1>{isUpdate ? integration.get('name') : 'Add integration'}</h1>
                    <div>Let's configure this HTTP integration.</div>
                </div>

                <div className="sixteen wide column">
                    <form className="ui form"
                          onSubmit={this.props.handleSubmit(this._handleSubmit)}
                    >
                        <div className="required field">
                            <label>Name</label>
                            <input type="text"
                                   placeholder="Name"
                                   {...name}
                                   required
                            />
                        </div>
                        <div className="field">
                            <label>Description</label>
                            <input type="text"
                                   placeholder="Description"
                                   {...description}
                            />
                        </div>
                        <div className="required field">
                            <label>URL</label>
                            <input type="text"
                                   placeholder="URL"
                                   {...http.url}
                                   required
                            />
                        </div>
                        <div className="required field">
                            <label>Method</label>
                            <div className="ui selection dropdown"
                                 ref={(e) => {
                                     this._methodSelector = e
                                     $(this._methodSelector)
                                         .dropdown({
                                             onChange: http.method.onChange
                                         })
                                 }}
                            >
                                <input type="hidden"
                                       {...http.method}
                                />
                                <i className="dropdown icon" />
                                <div className="default text">Method</div>
                                <div className="menu">
                                    <div className="item" data-value="GET">GET</div>
                                    <div className="item" data-value="POST">POST</div>
                                    <div className="item" data-value="PUT">PUT</div>
                                    <div className="item" data-value="DELETE">DELETE</div>
                                </div>
                            </div>
                        </div>
                        <div className="required field">
                            <label>Request content type</label>
                            <div className="ui selection dropdown"
                                 ref={(e) => {
                                     this._methodSelector = e
                                     $(this._methodSelector)
                                         .dropdown({
                                             onChange: http.request_content_type.onChange
                                         })
                                 }}
                            >
                                <input type="hidden"
                                       {...http.request_content_type}
                                />
                                <i className="dropdown icon" />
                                <div className="default text">Request content type</div>
                                <div className="menu">
                                    <div className="item" data-value="application/json">application/json</div>
                                </div>
                            </div>
                        </div>
                        <div className="field">
                            <label>Headers</label>
                            {!http.headers.length && <span>No headers</span>}
                            {http.headers.map((header, index) => {
                                return (
                                    <div className="fields"
                                         key={index}
                                    >
                                        <div className="seven wide field">
                                            <input type="text"
                                                   placeholder="Key"
                                                   {...header.key}
                                            />
                                        </div>
                                        <div className="seven wide field">
                                            <input type="text"
                                                   placeholder="Value"
                                                   {...header.value}
                                            />
                                        </div>
                                        <div className="two wide field">
                                            <button className="ui button red"
                                                    type="button"
                                                    onClick={() => {
                                                        http.headers.removeField(index)
                                                    }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="field">
                            <button className="ui button grey basic"
                                    type="button"
                                    onClick={http.headers.addField}
                            >
                                Add header
                            </button>
                        </div>
                        <div className="field">
                            <label>Parameters</label>
                            {!http.form.length && <span>No parameters</span>}
                            {http.form.map((param, index) => {
                                return (
                                    <div className="fields"
                                         key={index}
                                    >
                                        <div className="seven wide field">
                                            <input type="text"
                                                   placeholder="Key"
                                                   {...param.key}
                                            />
                                        </div>
                                        <div className="seven wide field">
                                            <input type="text"
                                                   placeholder="Value"
                                                   {...param.value}
                                            />
                                        </div>
                                        <div className="two wide field">
                                            <button className="ui button red"
                                                    type="button"
                                                    onClick={() => {
                                                        http.form.removeField(index)
                                                    }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="field">
                            <button className="ui button grey basic"
                                    type="button"
                                    onClick={http.form.addField}
                            >
                                Add parameter
                            </button>
                        </div>
                        <div className="field">

                            {(() => {
                                if (isUpdate) {
                                    return (
                                        <button className={classNames([
                                            'ui',
                                            'teal',
                                            'button',
                                            {
                                                loading: isSubmitting
                                            }
                                        ])}
                                                type="button"
                                                disabled={isSubmitting}
                                                onClick={() => {
                                                    this.setState({isTestShown: !this.state.isTestShown})
                                                }}
                                        >
                                            Test
                                        </button>
                                    )
                                }
                            })()}

                            <button className={classNames([
                                'ui',
                                'green',
                                'button',
                                {
                                    loading: isSubmitting
                                }
                            ])}
                                    disabled={isSubmitting}
                            >
                                {isUpdate ? 'Save changes' : 'Add integration'}
                            </button>

                            {(() => {
                                if (isUpdate) {
                                    return (
                                        <button className="ui basic light red floated right button"
                                                onClick={() => actions.deleteIntegration(integration)}
                                        >
                                            Delete
                                        </button>
                                    )
                                }
                            })()}
                        </div>
                    </form>

                    <div>
                        <ReactCSSTransitionGroup
                            transitionName="fade"
                            transitionEnterTimeout={200}
                            transitionLeaveTimeout={200}
                        >
                            {(() => {
                                if (isTestShown) {
                                    const url = http.url.value || ''

                                    return (
                                        <div>
                                            <br />
                                            <HttpIntegrationTesting
                                                url={url}
                                                integration={integration}
                                                loading={loading}
                                                test={this._handleTest}
                                            />
                                        </div>
                                    )
                                }
                            })()}
                        </ReactCSSTransitionGroup>
                    </div>
                </div>
            </div>
        )
    }
}

HttpIntegrationDetail.propTypes = {
    fields: PropTypes.object.isRequired,
    initializeForm: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    integration: PropTypes.object.isRequired,
    isUpdate: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired
}

export default reduxForm(
    {
        form: 'httpIntegration',
        fields
    }
)(HttpIntegrationDetail)
