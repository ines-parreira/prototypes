// @flow
import React from 'react'
import _trim from 'lodash/trim'
import _clone from 'lodash/clone'
import {Row, Col, Button} from 'reactstrap'

import InputField from '../../../../common/forms/InputField'

type Props = {
    title: string,
    fieldName: string,
    fields: Array<any>,
    validate?: Function,
    onChange: (fields: Array<any>) => *,
}

export default class ObjectListField extends React.Component<Props> {
    _add = () => {
        return this.props.onChange(
            _clone(this.props.fields).concat([
                {
                    key: '',
                    value: '',
                },
            ])
        )
    }

    _update = (index: number, key: string, value: string) => {
        const fields = _clone(this.props.fields)
        fields[index][key] = value

        return this.props.onChange(fields)
    }

    _remove = (index: number) => {
        const fields = _clone(this.props.fields)
        fields.splice(index, 1)
        return this.props.onChange(fields)
    }

    render() {
        const {fields, validate} = this.props

        return (
            <div>
                <label className="control-label">{`${this.props.title}s`}</label>
                {!fields.length && <p>{`No ${this.props.fieldName}`}</p>}
                {fields.map((header, index) => (
                    <Row key={index} className="mb-3 form-row">
                        <Col xs="5">
                            <InputField
                                type="text"
                                name="key"
                                placeholder="Key"
                                value={header.key}
                                error={
                                    validate ? validate('key', header.key) : ''
                                }
                                required
                                onChange={(value) => {
                                    this._update(index, 'key', _trim(value))
                                }}
                            />
                        </Col>
                        <Col className="flex-grow">
                            <InputField
                                type="text"
                                name="value"
                                placeholder="Value"
                                value={header.value}
                                error={
                                    validate
                                        ? validate('value', header.value)
                                        : ''
                                }
                                required
                                onChange={(value) => {
                                    this._update(index, 'value', value)
                                }}
                            />
                        </Col>
                        <Col xs="auto">
                            <Button
                                className="float-right"
                                color="secondary"
                                type="button"
                                onClick={() => this._remove(index)}
                                title={`Remove ${this.props.fieldName}`}
                            >
                                <i className="material-icons md-2 text-danger">
                                    delete
                                </i>
                            </Button>
                        </Col>
                    </Row>
                ))}
                <Button
                    size="sm"
                    color="secondary"
                    type="button"
                    onClick={this._add}
                >
                    <i className="material-icons mr-1">add</i>
                    {`Add ${this.props.fieldName}`}
                </Button>
            </div>
        )
    }
}
