import React, {PropTypes} from 'react'
import {Map} from 'immutable'

export default class ParametersEditor extends React.Component {
    addRow() {
        this.props.updateDict(this.props.list.push(Map({ key: '', value: '', editable: false })))
    }

    deleteRow(index) {
        this.props.updateDict(this.props.list.delete(index))
    }

    changeKey(index, key) {
        this.props.updateDict(this.props.list.setIn([index, 'key'], key))
    }

    changeValue(index, value) {
        this.props.updateDict(this.props.list.setIn([index, 'value'], value))
    }

    changeEditable(index, value) {
        this.props.updateDict(this.props.list.setIn([index, 'editable'], value))
    }

    render() {
        const { list } = this.props

        return (
            <div className="dict-editor">
            {
                list.map((dict, index) => (
                    <div key={index} className="fields">
                        <div className="six wide field">
                            <input
                                type="text"
                                value={dict.get('key')}
                                onChange={(e) => this.changeKey(index, e.target.value)}
                            />
                        </div>
                        <div className="eight wide field">
                            <input
                                type="text"
                                value={dict.get('value')}
                                onChange={(e) => this.changeValue(index, e.target.value)}
                            />
                        </div>
                        <div className="two wide field checkbox">
                            <label>Editable</label>
                            <input
                                type="checkbox"
                                checked={dict.get('editable')}
                                onChange={(e) => this.changeEditable(index, e.target.checked)}
                            />
                        </div>
                        <i className="close action icon" onClick={() => this.deleteRow(index)}/>
                    </div>
                ))
            }
                <i className="plus square action icon" onClick={() => this.addRow()}/>
            </div>
        )
    }
}

ParametersEditor.propTypes = {
    list: PropTypes.object.isRequired,
    updateDict: PropTypes.func.isRequired
}
