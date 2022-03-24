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
import {toJS} from 'utils'

import css from './Row.style.less'

type Props = {
    row: Map<any, any>
    meta: Map<any, any>
    refresh: () => void
} & ConnectedProps<typeof connector>

type State = {
    name?: string
    description?: string
    decoration: Map<any, any>
}

export class Row extends Component<Props, State> {
    state: State = {
        name: '',
        description: '',
        decoration: fromJS({
            color: '',
        }),
    }

    _setStateFromRow = (row: Map<any, any>) => {
        this.setState({
            name: row.get('name'),
            description: row.get('description') || '',
            decoration:
                row.get('decoration') ||
                fromJS({
                    color: '',
                }),
        })
    }

    componentWillReceiveProps(nextProps: Props) {
        // when adding new items, update the form inputs
        this._setStateFromRow(nextProps.row)
    }

    componentDidMount() {
        this._setStateFromRow(this.props.row)
    }

    _onEdit = () => {
        this.props.edit(this.props.row.toJS())
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

        const updatedRow = row
            .set('name', name)
            .set('description', description)
            .set('decoration', decoration)

        void save(updatedRow.toJS()).then(() => {
            refresh()
        })
    }

    _onCancel = () => {
        this.props.cancel(this.props.row.toJS())
    }

    _onRemove = () => {
        return this.props.remove(this.props.row.get('id')).then(() => {
            this.props.refresh()
        })
    }

    _onSelect = () => {
        this.props.select(this.props.row.toJS())
    }

    _changeName = (value: string) => {
        this.setState({name: value})
    }

    _changeDescription = (value: string) => {
        this.setState({description: value})
    }

    _changeColor = (value: string) => {
        this.setState({decoration: this.state.decoration.set('color', value)})
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
                                    value={this.state.decoration.get('color')}
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
                        <TagLabel decoration={row.get('decoration')}>
                            {row.get('name')}
                        </TagLabel>
                    </div>
                </td>

                <td>
                    <div className="cell-wrapper">{row.get('description')}</div>
                </td>

                <td className="smallest">
                    <div className="cell-wrapper justify-content-center">
                        {row.get('usage')}
                    </div>
                </td>

                <td className="smallest">
                    <div className={classNames('cell-wrapper', css.actions)}>
                        <IconButton
                            intent="text"
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
                                    Are you sure you want to delete this tag?{' '}
                                    <b>It will be removed from all tickets</b>.
                                </>
                            }
                            id={`remove-button-${row.get('id') as number}`}
                            onConfirm={this._onRemove}
                            placement="left"
                        >
                            {({uid, onDisplayConfirmation}) => (
                                <IconButton
                                    id={uid}
                                    intent="text"
                                    onClick={onDisplayConfirmation}
                                    className={classNames(
                                        css.actionButton,
                                        css.deleteActionButton
                                    )}
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
