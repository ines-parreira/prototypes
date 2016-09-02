import React, {PropTypes} from 'react'
import {Map} from 'immutable'

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
                    list.map((dict, index) => (
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
                            <div className="two wide field">
                                <div className="checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={dict.get('editable')}
                                            onChange={(e) => this.changeValue('editable', index, e.target.checked)}
                                        />
                                        Editable
                                    </label>
                                </div>
                            </div>
                            <i className="close action icon" onClick={() => this.deleteRow(index)} />
                        </div>
                    ))
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
