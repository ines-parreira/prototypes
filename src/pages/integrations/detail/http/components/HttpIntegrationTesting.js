import React, {PropTypes} from 'react'
import classNames from 'classnames'
import {reduxForm} from 'redux-form'
import {Loader} from '../../../../common/components/Loader'

export const fields = [
    'parameters[].key',
    'parameters[].value'
]

const variableRegexp = /{(.*?)}/g

class HttpIntegrationTesting extends React.Component {
    constructor(props) {
        super(props)

        this._generateParameters(props.url)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.url !== this.props.url) {
            this._generateParameters(nextProps.url)
        }
    }

    _generateParameters(url) {
        const parameters = url.match(variableRegexp) || []

        // can not set an array of object directly with redux-form so :
        // 1. empty parameters
        for (let i = 0; i < this.props.fields.parameters.length; i++) {
            this.props.fields.parameters.removeField(0)
        }

        // 2. populate parameters
        parameters.forEach((parameter) => {
            this.props.fields.parameters.addField({
                key: parameter,
                value: ''
            })
        })
    }

    render() {
        const {
            fields: {
                parameters
            },
            url,
            integration,
            loading,
            test
        } = this.props

        const isTesting = loading.get('testing')
        const serverResponse = integration.get('testing')

        let replacerCounter = 0
        const replacedUrl = url.replace(variableRegexp, () => {
            const p = parameters[replacerCounter]
            replacerCounter++
            return p ? p.value.value : ''
        })

        return (
            <div className="ui grid">
                <div className="four wide column">
                    <form className="ui form"
                          onSubmit={this.props.handleSubmit(test)}
                    >
                        {(() => {
                            if (parameters.length) {
                                return (
                                    <div>
                                        <p>
                                            Select values for each url parameters
                                        </p>
                                        <div className="ui info message clearfix">
                                            {parameters.map((parameter, index) => {
                                                return (
                                                    <div className="inline field"
                                                         key={index}
                                                         style={{
                                                             display: 'inline-block',
                                                             float: 'right'
                                                         }}
                                                    >
                                                        <label>{parameter.key.value}</label>
                                                        <input type="text"
                                                               placeholder="Parameter value"
                                                               {...parameter.value}
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            } else {
                                return (
                                    <div>
                                        <p>
                                            There are no parameters to configure in the url you specified
                                        </p>
                                    </div>
                                )
                            }
                        })()}

                        <button className={classNames([
                            'ui',
                            'green',
                            'button',
                            {
                                loading: isTesting
                            }
                        ])}
                                disabled={isTesting}
                                style={{
                                    marginTop: '16px'
                                }}
                        >
                            Launch test
                        </button>
                    </form>
                </div>
                <div className="twelve wide column">
                    <p>
                        We will call this url : <b>{replacedUrl}</b>
                    </p>

                    {(() => {
                        if (isTesting) {
                            return <Loader />
                        } else if (serverResponse) {
                            return (
                                <div className="ui segment">
                                    <h3>Response from server</h3>
                                    <code>
                                        test
                                    </code>
                                </div>
                            )
                        }
                    })()}
                </div>
            </div>
        )
    }
}

HttpIntegrationTesting.propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    integration: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    test: PropTypes.func.isRequired
}

export default reduxForm(
    {
        form: 'httpIntegrationTesting',
        fields
    }
)(HttpIntegrationTesting)
