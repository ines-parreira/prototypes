import React, {Component, PropTypes} from 'react'
import InputColor from '../../../common/components/InputColor'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {TagLabel} from '../../../common/utils/labels'

class ManageTagsTableRow extends Component {
    constructor(props) {
        super(props)

        this.state = {
            name: props.row.get('name'),
            decoration: props.row.get('decoration') || fromJS({
                color: ''
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        // when adding new items, update the form inputs
        this.setState({
            name: nextProps.row.get('name'),
            decoration: nextProps.row.get('decoration') || fromJS({
                color: ''
            })
        })
    }

    _onEdit = () => {
        this.props.onEdit(this.props.row.toJS())
    }

    _onSave = (e) => {
        e.preventDefault()

        if (!this.state.name) {
            return window.alert('You need to give a name to that tag')
        }

        const row = this.props.row
            .set('name', this.state.name)
            .set('decoration', this.state.decoration)

        this.props.onSave(row.toJS())
    }

    _onCancel = () => {
        this.props.onCancel(this.props.row.toJS())
    }

    _onRemove = () => {
        this.props.onRemove(this.props.row.get('id'))
    }

    _onSelect = () => {
        this.props.onSelect(this.props.row.toJS())
    }

    _changeName = (e) => {
        this.setState({
            name: e.target.value
        })
    }

    _changeColor = (e) => {
        this.setState({
            decoration: this.state.decoration.set('color', e.target.value)
        })
    }

    render() {
        const {row, meta} = this.props
        const rowClassName = classnames('manage-tags-table-row', {
            'manage-tags-table-row-edit': (meta.get('edit') === true)
        })

        return (
            <tr className={rowClassName}>
                <td
                    className="cell-wrapper cell-short clickable"
                    onClick={this._onSelect}
                >
                    <span className="ui checkbox">
                        <input
                            type="checkbox"
                            checked={meta.get('selected', false)}
                        />
                        <label />
                    </span>
                </td>

                <td className="manage-tags-table-col-name">
                    <div className="cell-wrapper manage-tags-table-row-item">
                        <TagLabel
                            name={row.get('name')}
                            decoration={row.get('decoration')}
                        />
                    </div>

                    <div className="cell-wrapper manage-tags-table-row-edit-item">
                        <div className="ui input manage-tags-input-name">
                            <input value={this.state.name} onChange={this._changeName} required />
                        </div>

                        <div className="manage-tags-input-color">
                            <InputColor value={this.state.decoration.get('color')} onChange={this._changeColor} />
                        </div>
                    </div>
                </td>

                <td className="manage-tags-table-col-count">
                    <div className="cell-wrapper manage-tags-table-row-item">
                        {row.get('usage_count')}
                    </div>
                </td>

                <td className="manage-tags-table-col-actions">
                    <div className="cell-wrapper manage-tags-table-row-actions">
                        <button type="button" onClick={this._onEdit}
                                className="ui light blue basic label manage-tags-action"
                        >
                            Edit
                        </button>

                        <button type="button" className="ui light red basic label manage-tags-action"
                                onClick={this._onRemove}
                        >
                            Delete
                        </button>
                    </div>

                    <div className="cell-wrapper manage-tags-table-row-edit-item">
                        <button type="button" onClick={this._onCancel}
                                className="ui light blue basic label manage-tags-action"
                        >
                            Cancel
                        </button>

                        <button
                            className="ui light green basic label manage-tags-action"
                            onClick={this._onSave}
                        >
                            Save changes
                        </button>
                    </div>
                </td>
            </tr>
        )
    }
}

ManageTagsTableRow.propTypes = {
    row: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired
}

export default ManageTagsTableRow
