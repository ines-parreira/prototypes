import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {
    Input,
    Label,
    Button,
    Popover,
    PopoverTitle,
    PopoverContent,
} from 'reactstrap'

import {ColorField} from '../../common/forms'
import {TagLabel} from '../../common/utils/labels'

import * as tagsActions from '../../../state/tags/actions'

@connect(null, {
    cancel: tagsActions.cancel,
    edit: tagsActions.edit,
    remove: tagsActions.remove,
    save: tagsActions.save,
    select: tagsActions.select,
})
export default class Row extends Component {
    static propTypes = {
        row: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
        edit: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        cancel: PropTypes.func.isRequired,
        remove: PropTypes.func.isRequired,
        select: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props)

        this.state = {
            name: props.row.get('name'),
            decoration: props.row.get('decoration') || fromJS({
                color: ''
            }),
            askRemoveConfirmation: false,
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
        this.props.edit(this.props.row.toJS())
    }

    _onSave = (e) => {
        e.preventDefault()

        const row = this.props.row
            .set('name', this.state.name)
            .set('decoration', this.state.decoration)

        this.props.save(row.toJS())
    }

    _onCancel = () => {
        this.props.cancel(this.props.row.toJS())
    }

    _onRemove = () => {
        this.setState({askRemoveConfirmation: false})
        return this.props.remove(this.props.row.get('id'))
    }

    _onSelect = () => {
        this.props.select(this.props.row.toJS())
    }

    _changeName = (e) => {
        this.setState({
            name: e.target.value
        })
    }

    _changeColor = (color) => {
        this.setState({
            decoration: this.state.decoration.set('color', color)
        })
    }

    _toggleRemoveConfirmation = () => {
        this.setState({askRemoveConfirmation: !this.state.askRemoveConfirmation})
    }

    render() {
        const {row, meta} = this.props
        const rowClassName = classnames('manage-tags-table-row', {
            'manage-tags-table-row-edit': (meta.get('edit') === true)
        })
        const submitId = `manage-tags-row-${Date.now()}`

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
                        <TagLabel decoration={row.get('decoration')}>
                            {row.get('name')}
                        </TagLabel>
                    </div>

                    <form
                        className="cell-wrapper manage-tags-table-row-edit-item align-items-center"
                        onSubmit={this._onSave}
                    >
                        <Input
                            className="mr-2"
                            value={this.state.name}
                            onChange={this._changeName}
                            required
                        />

                        <ColorField
                            input={{
                                value: this.state.decoration.get('color'),
                                onChange: this._changeColor
                            }}
                        />

                        <input type="submit" id={submitId} className="hidden" />
                    </form>
                </td>

                <td className="manage-tags-table-col-count">
                    <div className="cell-wrapper manage-tags-table-row-item">
                        {row.get('usage_count')}
                    </div>
                </td>

                <td className="manage-tags-table-col-actions">
                    <div className="cell-wrapper manage-tags-table-row-actions">
                        <Button
                            type="button"
                            color="info"
                            onClick={this._onEdit}
                            className="manage-tags-action mr-2"
                        >
                            Edit
                        </Button>

                        <Button
                            id={`remove-button-${row.get('id')}`}
                            type="button"
                            color="danger"
                            outline
                            onClick={this._toggleRemoveConfirmation}
                            className="manage-tags-action"
                        >
                            Delete
                        </Button>
                        <Popover
                            placement="bottom"
                            isOpen={this.state.askRemoveConfirmation}
                            target={`remove-button-${row.get('id')}`}
                            toggle={this._toggleRemoveConfirmation}
                        >
                            <PopoverTitle>Are you sure?</PopoverTitle>
                            <PopoverContent>
                                <p>
                                    Are you sure you want to delete this tag?{' '}
                                    <b>It will be removed from all tickets</b>.
                                </p>
                                <Button
                                    type="submit"
                                    color="success"
                                    onClick={this._onRemove}
                                >
                                    Confirm
                                </Button>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="cell-wrapper manage-tags-table-row-edit-item">
                        <Button
                            type="button"
                            color="secondary"
                            onClick={this._onCancel}
                            className="manage-tags-action mr-2"
                        >
                            Cancel
                        </Button>

                        <Label
                            for={submitId}
                            className="manage-tags-action btn btn-primary"
                        >
                            Save
                        </Label>
                    </div>
                </td>
            </tr>
        )
    }
}
