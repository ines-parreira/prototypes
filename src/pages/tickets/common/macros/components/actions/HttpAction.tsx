import React from 'react'
import {fromJS, Map} from 'immutable'
import {Row, Col, FormGroup, Label} from 'reactstrap'

import {
    AVAILABLE_HTTP_METHODS,
    JSON_CONTENT_TYPE,
    FORM_CONTENT_TYPE,
    HTTP_METHOD_GET,
} from 'config'
import {validateWebhookURL, validateWebhookURLToPattern} from 'utils'

import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import InputField from 'pages/common/forms/InputField'
import JsonField from 'pages/common/forms/JsonField'

import ParametersEditor from '../ParametersEditor'

type Props = {
    action: Map<string, any>
    index: number
    updateActionArgs: (index: number, args: Map<string, any>) => void
    updateActionTitle: (index: number, title: string) => void
}

export default class HttpAction extends React.Component<Props> {
    _setTitle = (title: string) => {
        this.props.updateActionTitle(this.props.index, title)
    }

    _setArgument = (name: string, value: unknown) => {
        const args: Map<string, any> = this.props.action.get(
            'arguments',
            fromJS({})
        )
        this.props.updateActionArgs(this.props.index, args.set(name, value))
    }

    _renderBody = (action: Map<string, any>) => {
        if (action.getIn(['arguments', 'method']) === HTTP_METHOD_GET) {
            return null
        }

        return (
            <FormGroup>
                <Label>Body</Label>

                <div className="d-inline fields">
                    <RadioFieldSet
                        className="mb-2"
                        options={[
                            {
                                value: FORM_CONTENT_TYPE,
                                label: FORM_CONTENT_TYPE,
                            },
                            {
                                value: JSON_CONTENT_TYPE,
                                label: JSON_CONTENT_TYPE,
                            },
                        ]}
                        selectedValue={action.getIn([
                            'arguments',
                            'content_type',
                        ])}
                        onChange={(value) =>
                            this._setArgument('content_type', value)
                        }
                    />
                </div>

                {action.getIn(['arguments', 'content_type']) ===
                FORM_CONTENT_TYPE ? (
                    <ParametersEditor
                        name="body"
                        list={action.getIn(['arguments', 'form'], fromJS([]))}
                        updateDict={(d) => this._setArgument('form', d)}
                    />
                ) : (
                    <JsonField
                        name="json"
                        value={action.getIn(['arguments', 'json'])}
                        onChange={(value) => this._setArgument('json', value)}
                    />
                )}
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
                    form="macro_form"
                />
                <Row className="form-row">
                    <Col xs="3">
                        <InputField
                            type="select"
                            name="method"
                            label="Method"
                            value={action.getIn(['arguments', 'method'])}
                            onChange={(value) =>
                                this._setArgument('method', value)
                            }
                            required
                            form="macro_form"
                        >
                            {AVAILABLE_HTTP_METHODS.map((method) => (
                                <option key={method} value={method}>
                                    {method}
                                </option>
                            ))}
                        </InputField>
                    </Col>
                    <Col xs="9">
                        <InputField
                            type="url"
                            title="Example: https://company.com/api"
                            name="url"
                            label="URL"
                            error={validateWebhookURL(
                                action.getIn(['arguments', 'url'])
                            )}
                            value={action.getIn(['arguments', 'url'])}
                            onChange={(value) =>
                                this._setArgument('url', value)
                            }
                            help="Example: https://company.com/api"
                            required
                            form="macro_form"
                            pattern={validateWebhookURLToPattern(
                                action.getIn(['arguments', 'url'])
                            )}
                        />
                    </Col>
                </Row>
                <FormGroup>
                    <Label>URL Parameters</Label>
                    <ParametersEditor
                        name="params"
                        list={action.getIn(['arguments', 'params'], fromJS([]))}
                        updateDict={(d) => this._setArgument('params', d)}
                    />
                </FormGroup>
                <FormGroup>
                    <Label>Headers</Label>
                    <ParametersEditor
                        name="headers"
                        list={action.getIn(
                            ['arguments', 'headers'],
                            fromJS([])
                        )}
                        updateDict={(d) => this._setArgument('headers', d)}
                    />
                </FormGroup>
                {this._renderBody(action)}
            </div>
        )
    }
}
