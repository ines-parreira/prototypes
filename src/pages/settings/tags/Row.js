import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {
    Form,
    Button,
    Popover,
    PopoverTitle,
    PopoverContent,
} from 'reactstrap'

import InputField from '../../common/forms/InputField'
import ColorPicker from '../../common/components/ColorPicker'
import {TagLabel} from '../../common/utils/labels'

import * as tagsActions from '../../../state/tags/actions'

export class Row extends Component {
    static propTypes = {
        row: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
        edit: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        cancel: PropTypes.func.isRequired,
        remove: PropTypes.func.isRequired,
        select: PropTypes.func.isRequired,
        refresh: PropTypes.func.isRequired
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
            .then(() => {
                this.props.refresh()
            })
    }

    _onCancel = () => {
        this.props.cancel(this.props.row.toJS())
    }

    _onRemove = () => {
        this.setState({askRemoveConfirmation: false})
        return this.props.remove(this.props.row.get('id'))
            .then(() => {
                this.props.refresh()
            })
    }

    _onSelect = () => {
        this.props.select(this.props.row.toJS())
    }

    _changeName = (value) => {
        this.setState({name: value})
    }

    _changeColor = (value) => {
        this.setState({decoration: this.state.decoration.set('color', value)})
    }

    _toggleRemoveConfirmation = () => {
        this.setState({askRemoveConfirmation: !this.state.askRemoveConfirmation})
    }

    render() {
        const {row, meta} = this.props

        const isEditing = meta.get('edit')

        if (isEditing) {
            return (
                <tr>
                    <td
                        className="cell-wrapper cell-short clickable"
                        onClick={this._onSelect}
                    >
                        <input
                            type="checkbox"
                            checked={meta.get('selected', false)}
                        />
                    </td>

                    <td colSpan="100">
                        <Form
                            className="cell-wrapper d-flex justify-content-between align-items-center"
                            onSubmit={this._onSave}
                        >
                            <div className="d-flex align-items-center">
                                <div className="mr-2">
                                    <InputField
                                        value={this.state.name}
                                        onChange={this._changeName}
                                        required
                                        inline
                                    />
                                </div>

                                <ColorPicker
                                    value={this.state.decoration.get('color')}
                                    onChange={this._changeColor}
                                />
                            </div>

                            <div>
                                <Button
                                    type="button"
                                    color="secondary"
                                    onClick={this._onCancel}
                                    className="mr-2"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                >
                                    Save
                                </Button>
                            </div>
                        </Form>
                    </td>
                </tr>
            )
        }

        return (
            <tr>
                <td
                    className="cell-wrapper cell-short clickable"
                    onClick={this._onSelect}
                >
                    <input
                        type="checkbox"
                        checked={meta.get('selected', false)}
                    />
                </td>

                <td>
                    <div className="cell-wrapper">
                        <TagLabel decoration={row.get('decoration')}>
                            {row.get('name')}
                        </TagLabel>
                    </div>
                </td>

                <td className="smallest">
                    <div className="cell-wrapper justify-content-center">
                        {row.get('usage_count')}
                    </div>
                </td>

                <td className="smallest">
                    <div className="cell-wrapper">
                        <Button
                            type="button"
                            color="link"
                            onClick={this._onEdit}
                            className="p-0 mr-3"
                        >
                            <i className="fa fa-fw fa-pencil mr-1" />
                            Edit
                        </Button>

                        <Button
                            id={`remove-button-${row.get('id')}`}
                            type="button"
                            color="link"
                            onClick={this._toggleRemoveConfirmation}
                            className="p-0"
                        >
                            <i className="fa fa-fw fa-close mr-1" />
                            Delete
                        </Button>
                        <Popover
                            placement="left"
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
                </td>
            </tr>
        )
    }
}

export default connect(null, {
    cancel: tagsActions.cancel,
    edit: tagsActions.edit,
    remove: tagsActions.remove,
    save: tagsActions.save,
    select: tagsActions.select,
    fetch: tagsActions.fetchTags
})(Row)
