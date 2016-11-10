import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {AVAILABLE_HTTP_METHODS} from '../../../../../../config'
import ParametersEditor from '../../../../../common/components/ParametersEditor'
import JsonField from './../../../../../common/components/formFields/JsonField'

export default class HttpAction extends React.Component {
    componentDidMount() {
        $(this.refs.method)
            .dropdown({
                onChange: (value) => {
                    this.props.updateActionArgs(
                        this.props.index,
                        this.props.action.get('arguments', fromJS({})).set('method', value)
                    )
                }
            })
            .dropdown('set selected', this.props.action.getIn(['arguments', 'method']))
    }

    _setTitle = (title) => {
        this.props.updateActionTitle(
            this.props.index,
            title
        )
    }

    _setUrl = (url) => {
        this.props.updateActionArgs(
            this.props.index,
            this.props.action.get('arguments', fromJS({})).set('url', url)
        )
    }

    _setHeaders = (headers) => {
        this.props.updateActionArgs(
            this.props.index,
            this.props.action.get('arguments', fromJS({})).set('headers', headers)
        )
    }

    _setParams = (params) => {
        this.props.updateActionArgs(
            this.props.index,
            this.props.action.get('arguments', fromJS({})).set('params', params)
        )
    }

    _setJson = (json) => {
        this.props.updateActionArgs(
            this.props.index,
            this.props.action.get('arguments', fromJS({})).set('json', json)
        )
    }

    _setForm = (form) => {
        this.props.updateActionArgs(
            this.props.index,
            this.props.action.get('arguments', fromJS({})).set('form', form)
        )
    }

    _setContentType = (contentType) => {
        this.props.updateActionArgs(
            this.props.index,
            this.props.action.get('arguments', fromJS({})).set('content_type', contentType)
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
                    onChange: this._setJson
                }}
            />
        )

        const isFormData = action.getIn(['arguments', 'content_type']) === 'multipart/form-data'

        if (isFormData) {
            field = (
                <ParametersEditor
                    list={action.getIn(['arguments', 'form'], fromJS([]))}
                    updateDict={this._setForm}
                />
            )
        }

        return (
            <div className="field">
                <label>Body</label>
                <div className="inline fields">
                    <div className="action field">
                        <div
                            className="ui radio checkbox"
                            onClick={() => this._setContentType('multipart/form-data')}
                        >
                            <input type="radio" checked={isFormData} readOnly/>
                            <label>multipart/form-data</label>
                        </div>
                    </div>
                    <div className="action field">
                        <div
                            className="ui radio checkbox"
                            onClick={() => this._setContentType('application/json')}
                        >
                            <input type="radio" checked={!isFormData} readOnly/>
                            <label>application/json</label>
                        </div>
                    </div>
                </div>

                {field}
            </div>
        )
    }

    render() {
        const {index, action, deleteAction} = this.props

        return (
            <div className="http">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(index)}
                />
                <h4>SEND HTTP REQUEST</h4>
                <div className="ui form">
                    <div className="field">
                        <label>Action Title</label>
                        <input
                            type="text"
                            value={action.get('title')}
                            onChange={(e) => this._setTitle(e.target.value)}
                        />
                    </div>
                    <div className="fields">
                        <div className="three wide field">
                            <label>Method</label>
                            <select
                                ref="method"
                                className="ui dropdown"
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
                            </select>
                        </div>
                        <div className="thirteen wide field">
                            <label>URL</label>
                            <input
                                type="text"
                                value={action.getIn(['arguments', 'url'])}
                                onChange={e => this._setUrl(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label>URL Parameters</label>
                        <ParametersEditor
                            list={action.getIn(['arguments', 'params'])}
                            updateDict={this._setParams}
                        />
                    </div>
                    <div className="field">
                        <label>Headers</label>
                        <ParametersEditor
                            list={action.getIn(['arguments', 'headers'])}
                            updateDict={this._setHeaders}
                        />
                    </div>
                    {this._renderBody(action)}
                </div>
                <div className="ui divider"></div>
            </div>
        )
    }
}

HttpAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
    updateActionTitle: PropTypes.func.isRequired,
    deleteAction: PropTypes.func.isRequired
}
