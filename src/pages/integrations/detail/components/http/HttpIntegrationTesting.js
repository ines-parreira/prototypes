import React from 'react'

import { Field, FieldArray, reduxForm } from 'redux-form'

import classNames from 'classnames'

import { Loader } from '../../../../common/components/Loader'
import { InputField } from '../../../../common/components/semantic'

const variableRegexp = /{(.*?)}/g

const renderParameters = ({ fields }) => {
    if (fields.length) {
        return (
            <div>
                <p>Select values for each url parameters:</p>
                <div className="ui info message clearfix">
                    {fields.map((parameter, index) => (
                        <Field
                            key={index}
                            className="inline field"
                            name="`${parameter}.value`"
                            label={parameter.key}
                            component={InputField}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>
            <p>There are no parameters to configure in the url you specified.</p>
        </div>
    )
}

renderParameters.propTypes = {
    fields: React.PropTypes.object.isRequired,
}

class HttpIntegrationTesting extends React.Component {

    componentDidMount() {
        this._generateParameters(this.props.url)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.url !== this.props.url) this._generateParameters(nextProps.url)
    }

    _generateParameters(url) {
        const parameters = url.match(variableRegexp) || []

        this.props.initialize({
            parameters: parameters.map(parameter => ({key: parameter, value: ''}))
        })
    }

    render() {
        const { url, integration, loading, test } = this.props

        const isTesting = loading.get('testing')
        const serverResponse = integration.get('testing')

        return (
            <div className="ui grid">
                <div className="four wide column">
                    <form className="ui form"
                          onSubmit={this.props.handleSubmit(test)}
                    >
                        <FieldArray name="parameters" component={renderParameters} />

                        <button
                            className={classNames('ui', 'green', 'button', {
                                loading: isTesting
                            })}
                            disabled={isTesting}
                            style={{ marginTop: '16px' }}
                        >
                            Launch test
                        </button>
                    </form>
                </div>
                <div className="twelve wide column">
                    <p>
                        We will call this url : <b>{url}</b>
                    </p>

                    {isTesting && <Loader />}
                    {serverResponse && (
                        <div className="ui segment">
                            <h3>Response from server</h3>
                            <code>
                                test
                            </code>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

HttpIntegrationTesting.propTypes = {
    initialize: React.PropTypes.func.isRequired,
    handleSubmit: React.PropTypes.func.isRequired,
    url: React.PropTypes.string.isRequired,
    integration: React.PropTypes.object.isRequired,
    loading: React.PropTypes.object.isRequired,
    test: React.PropTypes.func.isRequired,
}

export default reduxForm({
    form: 'httpIntegrationTesting'
})(HttpIntegrationTesting)
