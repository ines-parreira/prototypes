import React, {PropTypes} from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'

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
        const {list} = this.props

        return (
            <div className="dict-editor">
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
                            <div key={index} className="fields">
                                <div className="five wide field">
                                    <input
                                        type="text"
                                        placeholder="Key"
                                        value={dict.get('key')}
                                        onChange={(e) => this.changeValue('key', index, e.target.value)}
                                    />
                                </div>
                                <div className="eight wide field">
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={dict.get('value')}
                                        onChange={(e) => this.changeValue('value', index, e.target.value)}
                                    />
                                </div>
                                <div className="three wide field right-icons">
                                    <i
                                        className={requiredClassName}
                                        onClick={() => this.changeValue('required', index, !dict.get('required'))}
                                        data-content={requiredTitle}
                                        data-variation="inverted"
                                        ref={e => $(e).popup()}
                                    />
                                    <i
                                        className={editableClassName}
                                        onClick={() => this.changeValue('editable', index, !dict.get('editable'))}
                                        data-content={editableTitle}
                                        data-variation="inverted"
                                        ref={e => $(e).popup()}
                                    />
                                    <i className="red close action icon" onClick={() => this.deleteRow(index)} />
                                </div>
                            </div>
                        )
                    })
                }
                <i className="plus square action icon" onClick={() => this.addRow()} />
            </div>
        )
    }
}

ParametersEditor.propTypes = {
    list: PropTypes.object.isRequired,
    updateDict: PropTypes.func.isRequired
}
