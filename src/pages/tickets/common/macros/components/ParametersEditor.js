import React, {PropTypes} from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'
import {UncontrolledTooltip, Row, Col} from 'reactstrap'

import InputField from '../../../../common/forms/InputField'

export default class ParametersEditor extends React.Component {
    addRow() {
        this.props.updateDict(this.props.list.push(Map({
            key: '',
            value: '',
            editable: false,
            required: true
        })))
    }

    deleteRow(index) {
        this.props.updateDict(this.props.list.delete(index))
    }

    changeValue(key, index, value) {
        this.props.updateDict(this.props.list.setIn([index, key], value))
    }

    render() {
        const {list, name} = this.props

        return (
            <div>
                {
                    list.map((dict, index) => {
                        const editableClassName = classnames('ui circular action write icon', {
                            grey: !dict.get('editable'),
                            'blue inverted': dict.get('editable'),
                        })

                        const editableTitle = dict.get('editable')
                            ? 'Click to make this field not editable'
                            : 'Click to make this field editable'

                        const requiredClassName = classnames('ui circular action asterisk icon', {
                            grey: !dict.get('required'),
                            'blue inverted': dict.get('required'),
                        })

                        const requiredTitle = dict.get('required')
                            ? 'Click to make this field not required'
                            : 'Click to make this field required'

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
                                        onChange={value => this.changeValue('key', index, value)}
                                    />
                                </Col>
                                <Col xs="6">
                                    <InputField
                                        type="text"
                                        placeholder="Value"
                                        value={dict.get('value')}
                                        onChange={value => this.changeValue('value', index, value)}
                                    />
                                </Col>
                                <Col
                                    xs="3"
                                    className="d-flex align-items-center"
                                >
                                    <i
                                        id={`parameter-required-${name}-${index}`}
                                        className={requiredClassName}
                                        onClick={() => this.changeValue('required', index, !dict.get('required'))}
                                    />
                                    <UncontrolledTooltip
                                        placement="top"
                                        target={`parameter-required-${name}-${index}`}
                                        delay={0}
                                    >
                                        {requiredTitle}
                                    </UncontrolledTooltip>
                                    <i
                                        id={`parameter-editable-${name}-${index}`}
                                        className={editableClassName}
                                        onClick={() => this.changeValue('editable', index, !dict.get('editable'))}
                                    />
                                    <UncontrolledTooltip
                                        placement="top"
                                        target={`parameter-editable-${name}-${index}`}
                                        delay={0}
                                    >
                                        {editableTitle}
                                    </UncontrolledTooltip>
                                    <i
                                        className="red close action icon"
                                        onClick={() => this.deleteRow(index)}
                                    />
                                </Col>
                            </Row>
                        )
                    })
                }
                <i className="plus square action icon" onClick={() => this.addRow()} />
            </div>
        )
    }
}

ParametersEditor.propTypes = {
    name: PropTypes.string.isRequired,
    list: PropTypes.object.isRequired,
    updateDict: PropTypes.func.isRequired
}
