import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {AVAILABLE_HTTP_METHODS, JSON_CONTENT_TYPE, FORM_CONTENT_TYPE} from '../../../../../../config'
import ParametersEditor from '../../../../../common/components/ParametersEditor'
import JsonField from '../../../../../common/forms/JsonField'
import InputField from '../../../../../common/forms/InputField'
import SelectField from '../../../../../common/forms/SelectField'

export default class HttpAction extends React.Component {
    _setTitle = (title) => {
        this.props.updateActionTitle(
            this.props.index,
            title
        )
    }

    _setArgument = (name, value) => {
        this.props.updateActionArgs(
            this.props.index,
            this.props.action.get('arguments', fromJS({})).set(name, value)
        )
    }

    _renderBody = (action) => {
        if (action.getIn(['arguments', 'method']) === 'GET') {
            return null
        }

        let field = (
            <JsonField
                input={{
                    value: action.getIn(['arguments', 'json']),
                    onChange: v => this._setArgument('json', v)
                }}
            />
        )

        const isFormData = action.getIn(['arguments', 'content_type']) === FORM_CONTENT_TYPE

        if (isFormData) {
            field = (
                <ParametersEditor
                    list={action.getIn(['arguments', 'form'], fromJS([]))}
                    updateDict={d => this._setArgument('form', d)}
                />
            )
        }

        return (
            <div className="field">
                <label>Body</label>
                <div className="d-inline fields">
                    <div className="action field pl-0">
                        <div
                            className="ui radio checkbox"
                            onClick={() => this._setArgument('content_type', FORM_CONTENT_TYPE)}
                        >
                            <input type="radio" checked={isFormData} readOnly />
                            <label>{FORM_CONTENT_TYPE}</label>
                        </div>
                    </div>
                    <div className="action field pl-0">
                        <div
                            className="ui radio checkbox"
                            onClick={() => this._setArgument('content_type', JSON_CONTENT_TYPE)}
                        >
                            <input type="radio" checked={!isFormData} readOnly />
                            <label>{JSON_CONTENT_TYPE}</label>
                        </div>
                    </div>
                </div>

                {field}
            </div>
        )
    }

    render() {
        const {action} = this.props

        return (
            <div className="http">
                <div className="ui form">
                    <div className="field required">
                        <label>Action Title</label>
                        <input
                            type="text"
                            value={action.get('title')}
                            onChange={(e) => this._setTitle(e.target.value)}
                            required="required"
                        />
                    </div>
                    <div className="fields">
                        <div className="three wide field">
                            <label>Method</label>
                            <SelectField
                                input={{
                                    value: action.getIn(['arguments', 'method']),
                                    onChange: v => this._setArgument('method', v)
                                }}
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
                            </SelectField>
                        </div>
                        <div className="thirteen wide field required">
                            <label>URL</label>
                            <InputField
                                input={{
                                    value: action.getIn(['arguments', 'url']),
                                    onChange: e => this._setArgument('url', e.target.value)
                                }}
                                required
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label>URL Parameters</label>
                        <ParametersEditor
                            list={action.getIn(['arguments', 'params'])}
                            updateDict={d => this._setArgument('params', d)}
                        />
                    </div>
                    <div className="field">
                        <label>Headers</label>
                        <ParametersEditor
                            list={action.getIn(['arguments', 'headers'])}
                            updateDict={d => this._setArgument('headers', d)}
                        />
                    </div>
                    {this._renderBody(action)}
                </div>
            </div>
        )
    }
}

HttpAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
    updateActionTitle: PropTypes.func.isRequired,
}
