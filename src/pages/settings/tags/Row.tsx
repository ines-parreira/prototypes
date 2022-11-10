import React, {Component, FormEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {Form} from 'reactstrap'
import classNames from 'classnames'

import {DEFAULT_TAG_COLOR} from 'config'
import {TagDecoration} from 'models/tag/types'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import ColorPicker from 'pages/common/components/ColorPicker/ColorPicker'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import {TagLabel} from 'pages/common/utils/labels'
import CheckBox from 'pages/common/forms/CheckBox'
import TextInput from 'pages/common/forms/input/TextInput'
import {cancel, edit, remove, save, select} from 'state/tags/actions'
import {REMOVE_TAG_ERROR} from 'state/tags/constants'
import {ServerErrorAction} from 'store/middlewares/serverErrorHandler'
import {Tag} from 'state/tags/types'
import {toJS} from 'utils'

import css from './Row.style.less'

type Props = {
    row: Tag
    meta: Map<any, any>
    refresh: () => void
} & ConnectedProps<typeof connector>

type State = {
    name?: string
    description?: string
    decoration: TagDecoration
}

export class Row extends Component<Props, State> {
    state: State = {
        name: '',
        description: '',
        decoration: {
            color: '',
        },
    }

    _setStateFromRow = (row: Tag) => {
        this.setState({
            name: row.name,
            description: row.description || '',
            decoration: row.decoration || {
                color: '',
            },
        })
    }

    componentWillReceiveProps(nextProps: Props) {
        // when adding new items, update the form inputs
        if (nextProps.row !== this.props.row) {
            this._setStateFromRow(nextProps.row)
        }
    }

    componentDidMount() {
        this._setStateFromRow(this.props.row)
    }

    _onEdit = () => {
        this.props.edit(this.props.row)
    }

    _onSave = (event: FormEvent) => {
        event.preventDefault()
        const {name, description} = this.state
        let {decoration} = this.state
        const {row, save, refresh} = this.props

        const obj: TagDecoration = toJS(decoration)
        // Set default blue color if no color
        if (obj.color === '') {
            obj.color = DEFAULT_TAG_COLOR
            decoration = fromJS(obj)
            this.setState({decoration})
        }

        const updatedRow = {
            ...row,
            name: name!,
            description,
            decoration,
        }

        void save(updatedRow).then(() => {
            refresh()
        })
    }

    _onCancel = () => {
        this.props.cancel(this.props.row)
    }

    _onRemove = () => {
        return this.props.remove(this.props.row.id.toString()).then((error) => {
            if ((error as ServerErrorAction)?.type !== REMOVE_TAG_ERROR) {
                this.props.refresh()
            }
        })
    }

    _onSelect = () => {
        this.props.select(this.props.row)
    }

    _changeName = (value: string) => {
        this.setState({name: value})
    }

    _changeDescription = (value: string) => {
        this.setState({description: value})
    }

    _changeColor = (value: string) => {
        this.setState({decoration: {color: value}})
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
                        <CheckBox isChecked={meta.get('selected', false)} />
                    </td>

                    <td colSpan={100}>
                        <Form
                            className="cell-wrapper d-flex justify-content-between align-items-center"
                            onSubmit={this._onSave}
                        >
                            <div className="d-flex mr-2 align-items-center">
                                <div className="mr-2">
                                    <TextInput
                                        value={this.state.name}
                                        onChange={this._changeName}
                                        isRequired
                                    />
                                </div>
                                <div className="mr-2">
                                    <TextInput
                                        size={100}
                                        value={this.state.description}
                                        onChange={this._changeDescription}
                                    />
                                </div>

                                <ColorPicker
                                    value={this.state.decoration.color}
                                    defaultValue={DEFAULT_TAG_COLOR}
                                    onChange={this._changeColor}
                                />
                            </div>

                            <div className="d-flex">
                                <Button
                                    intent="secondary"
                                    onClick={this._onCancel}
                                    className="mr-2"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </Form>
                    </td>
                </tr>
            )
        }

        return (
            <tr className={css.row}>
                <td
                    className="cell-wrapper cell-short clickable"
                    onClick={this._onSelect}
                >
                    <CheckBox isChecked={meta.get('selected', false)} />
                </td>

                <td className="smallest">
                    <div className="cell-wrapper">
                        <TagLabel decoration={fromJS(row.decoration)}>
                            {row.name}
                        </TagLabel>
                    </div>
                </td>

                <td>
                    <div className="cell-wrapper">{row.description}</div>
                </td>

                <td className="smallest">
                    <div className="cell-wrapper justify-content-center">
                        {row.usage}
                    </div>
                </td>

                <td className="smallest">
                    <div className={classNames('cell-wrapper', css.actions)}>
                        <IconButton
                            fillStyle="ghost"
                            intent="secondary"
                            onClick={this._onEdit}
                            className={classNames(css.actionButton, 'mr-1')}
                        >
                            edit
                        </IconButton>

                        <ConfirmationPopover
                            buttonProps={{
                                intent: 'destructive',
                            }}
                            content={
                                <>
                                    Are you sure you want to delete this tag?
                                    <ul className={css.listWrapper}>
                                        <li>
                                            It will be removed from all tickets
                                        </li>

                                        <li>
                                            Historical Statistics for this tag
                                            will be lost
                                        </li>

                                        <li>
                                            It will not be possible to add the
                                            tag back to the tickets it was
                                            previously on
                                        </li>
                                    </ul>
                                </>
                            }
                            id={`remove-button-${row.id}`}
                            onConfirm={this._onRemove}
                            placement="left"
                        >
                            {({uid, onDisplayConfirmation}) => (
                                <IconButton
                                    id={uid}
                                    fillStyle="ghost"
                                    intent="destructive"
                                    onClick={onDisplayConfirmation}
                                    className="css.actionButton"
                                >
                                    delete
                                </IconButton>
                            )}
                        </ConfirmationPopover>
                    </div>
                </td>
            </tr>
        )
    }
}

const connector = connect(null, {
    cancel,
    edit,
    remove,
    save,
    select,
})

export default connector(Row)
