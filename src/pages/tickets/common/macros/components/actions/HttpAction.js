import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {Row, Col, FormGroup, Label} from 'reactstrap'

import {AVAILABLE_HTTP_METHODS, JSON_CONTENT_TYPE, FORM_CONTENT_TYPE} from '../../../../../../config'

import ParametersEditor from '../ParametersEditor'

import InputField from '../../../../../common/forms/InputField'
import JsonField from '../../../../../common/forms/JsonField'

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
                name="json"
                value={action.getIn(['arguments', 'json'])}
                onChange={value => this._setArgument('json', value)}
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
            <FormGroup>
                <Label>Body</Label>
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
            </FormGroup>
        )
    }

    render() {
        const {action} = this.props

        return (
            <div className="http">
                <InputField
                    type="text"
                    name="title"
                    label="Title"
                    value={action.get('title')}
                    onChange={this._setTitle}
                    required
                />
                <Row>
                    <Col xs="3">
                        <InputField
                            type="select"
                            name="method"
                            label="Method"
                            value={action.getIn(['arguments', 'method'])}
                            onChange={value => this._setArgument('method', value)}
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
                    </Col>
                    <Col xs="9">
                        <InputField
                            type="text"
                            name="url"
                            label="URL"
                            value={action.getIn(['arguments', 'url'])}
                            onChange={value => this._setArgument('url', value)}
                            required
                        />
                    </Col>
                </Row>
                <FormGroup>
                    <Label>URL Parameters</Label>
                    <ParametersEditor
                        name="params"
                        list={action.getIn(['arguments', 'params'])}
                        updateDict={d => this._setArgument('params', d)}
                    />
                </FormGroup>
                <FormGroup>
                    <Label>Headers</Label>
                    <ParametersEditor
                        name="headers"
                        list={action.getIn(['arguments', 'headers'])}
                        updateDict={d => this._setArgument('headers', d)}
                    />
                </FormGroup>
                {this._renderBody(action)}
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
