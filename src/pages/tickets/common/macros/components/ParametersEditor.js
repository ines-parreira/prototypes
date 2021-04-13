import React from 'react'
import PropTypes from 'prop-types'
import {Map} from 'immutable'
import classnames from 'classnames'
import {Row, Col, Button} from 'reactstrap'

import Tooltip from '../../../../common/components/Tooltip.tsx'
import InputField from '../../../../common/forms/InputField'
import {MAX_HEADER_LENGTH} from '../../../../../config.ts'
import {hasUnicodeChars} from '../../../../../utils.ts'

import css from './ParametersEditor.less'

export default class ParametersEditor extends React.Component {
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

    deleteRow = (index) => {
        this.props.updateDict(this.props.list.delete(index))
    }

    changeValue = (key, index, value) => {
        this.props.updateDict(this.props.list.setIn([index, key], value))
    }

    validateHeaderName = (value: String): ?String => {
        if (this.props.name === 'headers' && hasUnicodeChars(value)) {
            return "Header's name can't contain unicode characters."
        }
    }

    render() {
        const {list, name} = this.props

        return (
            <div>
                {list.map((dict, index) => {
                    const requiredClassName = classnames('btn btn-sm mr-2', {
                        'btn-secondary': !dict.get('required'),
                        'btn-primary': dict.get('required'),
                    })

                    const requiredTitle = dict.get('required')
                        ? 'Click to make this field not required'
                        : 'Click to make this field required'

                    const editableClassName = classnames('btn btn-sm mr-2', {
                        'btn-secondary': !dict.get('editable'),
                        'btn-primary': dict.get('editable'),
                    })

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
                                    required
                                    form="macro_form"
                                    maxLength={MAX_HEADER_LENGTH}
                                    onChange={(value) =>
                                        this.changeValue('key', index, value)
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
                                    required={this.props.name === 'headers'}
                                    onChange={(value) =>
                                        this.changeValue('value', index, value)
                                    }
                                />
                            </Col>
                            <Col className="d-flex col-sm-auto">
                                <button
                                    type="button"
                                    id={`parameter-required-${name}-${index}`}
                                    className={requiredClassName}
                                    onClick={() =>
                                        this.changeValue(
                                            'required',
                                            index,
                                            !dict.get('required')
                                        )
                                    }
                                >
                                    <span
                                        className={classnames(css.asteriskWrap)}
                                    >
                                        <i className="icon-custom icon-asterisk" />
                                    </span>
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
                                    onClick={() =>
                                        this.changeValue(
                                            'editable',
                                            index,
                                            !dict.get('editable')
                                        )
                                    }
                                >
                                    <i className="material-icons md-2">edit</i>
                                </button>
                                <Tooltip
                                    placement="top"
                                    target={`parameter-editable-${name}-${index}`}
                                >
                                    {editableTitle}
                                </Tooltip>
                                <Button
                                    type="button"
                                    size="sm"
                                    id={`parameter-editable-${name}-${index}`}
                                    onClick={() => this.deleteRow(index)}
                                >
                                    <i className="material-icons md-2 text-danger">
                                        delete
                                    </i>
                                </Button>
                            </Col>
                        </Row>
                    )
                })}
                <Button size="sm" onClick={this.addRow}>
                    <i className="material-icons md-2">add</i>
                </Button>
            </div>
        )
    }
}

ParametersEditor.propTypes = {
    name: PropTypes.string.isRequired,
    list: PropTypes.object.isRequired,
    updateDict: PropTypes.func.isRequired,
}
