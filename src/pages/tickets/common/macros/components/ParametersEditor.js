import React, {PropTypes} from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'
import {Row, Col} from 'reactstrap'

import Tooltip from '../../../../common/components/Tooltip'
import InputField from '../../../../common/forms/InputField'
import {MAX_HEADER_LENGTH} from '../../../../../config'

export default class ParametersEditor extends React.Component {
    addRow = () => {
        this.props.updateDict(this.props.list.push(Map({
            key: '',
            value: '',
            editable: false,
            required: true
        })))
    }

    deleteRow = (index) => {
        this.props.updateDict(this.props.list.delete(index))
    }

    changeValue = (key, index, value) => {
        this.props.updateDict(this.props.list.setIn([index, key], value))
    }

    render() {
        const {list, name} = this.props

        return (
            <div>
                {
                    list.map((dict, index) => {
                        const requiredClassName = classnames('btn btn-sm mr-2', {
                            'btn-secondary': !dict.get('required'),
                            'btn-info': dict.get('required'),
                        })

                        const requiredTitle = dict.get('required')
                            ? 'Click to make this field not required'
                            : 'Click to make this field required'

                        const editableClassName = classnames('btn btn-sm mr-2', {
                            'btn-secondary': !dict.get('editable'),
                            'btn-info': dict.get('editable'),
                        })

                        const editableTitle = dict.get('editable')
                            ? 'Click to make this field not editable'
                            : 'Click to make this field editable'

                        return (
                            <Row
                                key={index}
                                className="mb-3 form-row"
                            >
                                <Col xs="3">
                                    <InputField
                                        type="text"
                                        placeholder="Key"
                                        value={dict.get('key')}
                                        required
                                        form="macro_form"
                                        maxLength={MAX_HEADER_LENGTH}
                                        onChange={value => this.changeValue('key', index, value)}
                                    />
                                </Col>
                                <Col xs="6">
                                    <InputField
                                        type="text"
                                        placeholder="Value"
                                        value={dict.get('value')}
                                        form="macro_form"
                                        maxLength={MAX_HEADER_LENGTH}
                                        required={this.props.name === 'headers'}
                                        onChange={value => this.changeValue('value', index, value)}
                                    />

                                </Col>
                                <Col
                                    xs="3"
                                    className="d-flex align-items-center"
                                >
                                    <button
                                        type="button"
                                        id={`parameter-required-${name}-${index}`}
                                        className={requiredClassName}
                                        onClick={() => this.changeValue('required', index, !dict.get('required'))}
                                    >
                                        <i className="fa fa-fw fa-asterisk" />
                                    </button>
                                    <Tooltip
                                        placement="top"
                                        target={`parameter-required-${name}-${index}`}
                                    >
                                        {requiredTitle}
                                    </Tooltip>
                                    <button
                                        type="button"
                                        id={`parameter-editable-${name}-${index}`}
                                        className={editableClassName}
                                        onClick={() => this.changeValue('editable', index, !dict.get('editable'))}
                                    >
                                        <i className="fa fa-fw fa-pencil" />
                                    </button>
                                    <Tooltip
                                        placement="top"
                                        target={`parameter-editable-${name}-${index}`}
                                    >
                                        {editableTitle}
                                    </Tooltip>
                                    <i
                                        className="fa fa-fw fa-close text-danger clickable"
                                        onClick={() => this.deleteRow(index)}
                                    />
                                </Col>
                            </Row>
                        )
                    })
                }
                <i
                    className="fa fa-fw fa-plus clickable"
                    onClick={this.addRow}
                />
            </div>
        )
    }
}

ParametersEditor.propTypes = {
    name: PropTypes.string.isRequired,
    list: PropTypes.object.isRequired,
    updateDict: PropTypes.func.isRequired
}
