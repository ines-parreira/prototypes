import React, {PropTypes} from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'

export default class ParametersEditor extends React.Component {
    addRow() {
        this.props.updateDict(this.props.list.push(Map({
            key: '',
            value: '',
            editable: false
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
                        const className = classnames('ui circular action write icon', {inverted: dict.get('editable')})
                        const title = dict.get('editable')
                            ? 'Click to make this field not editable'
                            : 'Click to make this field editable'

                        return (
                            <div key={index} className="fields">
                                <div className="six wide field">
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
                                <div className="two wide field right-icons">
                                    <i
                                        className={className}
                                        onClick={() => this.changeValue('editable', index, !dict.get('editable'))}
                                        title={title}
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
