import React, {Component} from 'react'
import {Map, List} from 'immutable'
import {Row, Col} from 'reactstrap'

import InputField from 'pages/common/forms/input/InputField'
import IconButton from 'pages/common/components/button/IconButton'
import Tooltip from '../../../../common/components/Tooltip'
import {MAX_HEADER_LENGTH} from '../../../../../config'
import {hasUnicodeChars} from '../../../../../utils'

type Props = {
    list: List<any>
    name: string
    updateDict: (list: List<any>) => void
}

export default class ParametersEditor extends Component<Props> {
    addRow = () => {
        this.props.updateDict(
            this.props.list.push(
                Map({
                    key: '',
                    value: '',
                    editable: false,
                    required: true,
                })
            )
        )
    }

    deleteRow = (index: number) => {
        this.props.updateDict(this.props.list.delete(index))
    }

    changeValue = (key: string, index: number, value: any) => {
        this.props.updateDict(this.props.list.setIn([index, key], value))
    }

    validateHeaderName = (value: string): string | undefined => {
        if (this.props.name === 'headers' && hasUnicodeChars(value)) {
            return "Header's name can't contain unicode characters."
        }
    }

    render() {
        const {list, name} = this.props

        return (
            <div>
                {list.map((dict: Map<any, any>, index) => {
                    const requiredTitle = dict.get('required')
                        ? 'Click to make this field not required'
                        : 'Click to make this field required'

                    const editableTitle = dict.get('editable')
                        ? 'Click to make this field not editable'
                        : 'Click to make this field editable'

                    return (
                        <Row key={index} className="mb-3 form-row">
                            <Col xs="3">
                                <InputField
                                    type="text"
                                    placeholder="Key"
                                    value={dict.get('key')}
                                    error={this.validateHeaderName(
                                        dict.get('key')
                                    )}
                                    isRequired
                                    form="macro_form"
                                    maxLength={MAX_HEADER_LENGTH}
                                    onChange={(value) =>
                                        this.changeValue('key', index!, value)
                                    }
                                />
                            </Col>
                            <Col className="flex-grow">
                                <InputField
                                    type="text"
                                    placeholder="Value"
                                    value={dict.get('value')}
                                    form="macro_form"
                                    maxLength={MAX_HEADER_LENGTH}
                                    isRequired={this.props.name === 'headers'}
                                    onChange={(value) =>
                                        this.changeValue('value', index!, value)
                                    }
                                />
                            </Col>
                            <Col className="d-flex col-sm-auto">
                                <IconButton
                                    intent={
                                        dict.get('required')
                                            ? 'primary'
                                            : 'secondary'
                                    }
                                    id={`parameter-required-${name}-${index!}`}
                                    className="mr-2"
                                    iconClassName="icon-custom icon-asterisk"
                                    onClick={() =>
                                        this.changeValue(
                                            'required',
                                            index!,
                                            !dict.get('required')
                                        )
                                    }
                                />
                                <Tooltip
                                    placement="top"
                                    target={`parameter-required-${name}-${index!}`}
                                >
                                    {requiredTitle}
                                </Tooltip>
                                <IconButton
                                    className="mr-2"
                                    id={`parameter-editable-${name}-${index!}`}
                                    intent={
                                        dict.get('editable')
                                            ? 'primary'
                                            : 'secondary'
                                    }
                                    onClick={() =>
                                        this.changeValue(
                                            'editable',
                                            index!,
                                            !dict.get('editable')
                                        )
                                    }
                                >
                                    edit
                                </IconButton>
                                <Tooltip
                                    placement="top"
                                    target={`parameter-editable-${name}-${index!}`}
                                >
                                    {editableTitle}
                                </Tooltip>
                                <IconButton
                                    intent="destructive"
                                    id={`parameter-editable-${name}-${index!}`}
                                    onClick={() => this.deleteRow(index!)}
                                >
                                    delete
                                </IconButton>
                            </Col>
                        </Row>
                    )
                })}
                <IconButton intent="secondary" onClick={this.addRow}>
                    add
                </IconButton>
            </div>
        )
    }
}
